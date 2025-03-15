import { exec, execSync, spawn } from "child_process"
import { existsSync, writeFileSync, readFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { Hotkey, HotkeyI, Hotstring, HotstringI, HotstringOptions, HotstringOptionCodes } from "../commons/ahk_objects"
import { createPromiseMessage } from "../commons/common"
import defaultAhk from "../../resources/default.ahk?asset"

enum AhkMessage
{
    KEEP_ALIVE = 'KeepAlive',
    KILL = 'KillAhk',
    // VERBOSE = 'VerboseLevel'
}

class HotkeyBuilder implements HotkeyI
{

    keys: string
    action: string
    modifiers: [string, string, string]

    private constructor(keys: string, action: string, modifiers: [string, string, string])
    {
        this.keys = keys
        this.action = action
        this.modifiers = modifiers
    }

    public static fromJson(json): HotkeyBuilder
    {
        return new HotkeyBuilder(json.keys, json.action, json.modifiers)
    }

    public buildAhk(): string
    {
        return `${this.modifiers[0]}${this.modifiers[1]}${this.modifiers[2]}::\n{${this.action}\n}`
    }

}

class HotstringBuilder implements HotstringI
{
    keys: string
    action: string
    options: HotstringOptionCodes[]

    constructor(keys: string, action: string, options: HotstringOptionCodes[] = [])
    {
        this.keys = keys
        this.action = action
        this.options = options
    }

    public static fromJson(json: HotstringI): HotstringBuilder
    {
        return new HotstringBuilder(json.keys, json.action, json.options)
    }

    public buildAhk(): string
    {
        let options: string = ''
        for (const option of this.options)
        {
            options += `${option}`
        }
        return `:${options}:${this.keys}::${this.action}`
    }
}

export class AhkManager
{

    private static instance: AhkManager

    private ahkExecPath: string
    private defaultCompiledScriptPath: string
    private keepAliveInterval: NodeJS.Timeout | undefined
    private hotkeyDict: Map<string, HotkeyBuilder>
    private hotstringDict: Map<string, HotstringBuilder>
    private procIds: Map<number, boolean>

    private constructor()
    {
        this.ahkExecPath = String.raw`C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe`

        if (!existsSync(this.ahkExecPath))
        {
            this.ahkExecPath = String.raw`%LOCALAPPDATA%\Programs\AutoHotkey\v2\AutoHotkey64.exe`
            if (!existsSync(this.ahkExecPath))
            {
                throw new Error("AutoHotkey executable not found")
            }
        }

        this.defaultCompiledScriptPath = join(tmpdir(), 'default-ahk-manager.ahk')
        this.hotkeyDict = new Map<string, HotkeyBuilder>()
        this.hotstringDict = new Map<string, HotstringBuilder>()
        this.procIds = new Map<number, boolean>()
    }

    public static getInstance(): AhkManager
    {
        if (!AhkManager.instance)
        {
            try
            {
                AhkManager.instance = new AhkManager()
            }
            catch (e)
            {
                console.error((e as Error).message)
            }
        }
        return AhkManager.instance
    }

    private broadcast(message: AhkMessage, wParam: number = 0, lParam: number = 0, sync: boolean = false): void
    {
        const command = `echo PostMessage(DllCall("RegisterWindowMessage", "Str", "${message}"), ${wParam}, ${lParam}, , 0xFFFF) | "${this.ahkExecPath}" *`
        if (sync)
        {
            execSync(command)
        }
        else
        {
            exec(command)
        }
    }

    private keepAlive(): void
    {
        this.broadcast(AhkMessage.KEEP_ALIVE)
    }

    public kill(): Promise<string>
    {
        try
        {
            this.broadcast(AhkMessage.KILL, 9, 0, true)
            this.cleanup()
            return createPromiseMessage(true, 'AHK script killed')
        }
        catch (e)
        {
            console.error((e as Error).message)
            return createPromiseMessage(false, 'Error killing AHK script')
        }
    }

    public restart(): Promise<string>
    {
        try
        {
            // Kill code 30 is used to restart the script
            this.broadcast(AhkMessage.KILL, 30, 0, true)
            return createPromiseMessage(true, 'AHK script restarted')
        }
        catch (e)
        {
            console.error((e as Error).message)
            return createPromiseMessage(false, 'Error restarting AHK script')
        }
    }

    private cleanup(pid: number = 0): void
    {
        if (pid === 0)
        {
            for (const pid of this.procIds.keys())
            {
                this.procIds.set(pid, false)
            }
        }
        else
        {
            for (const running of this.procIds.values())
            {
                if (running)
                {
                    return
                }
            }
        }

        // Clear interval only if there are no more running processes
        if (this.keepAliveInterval)
        {
            clearInterval(this.keepAliveInterval)
            this.procIds.clear()
        }
    }

    public addHotkeyFromJson(jsonStringified: string, overwrite: boolean = false): Promise<string>
    {
        try
        {
            const hotkey: HotkeyBuilder = HotkeyBuilder.fromJson(JSON.parse(jsonStringified))
            if (!overwrite && this.hotkeyDict.has(hotkey.keys))
            {
                return createPromiseMessage(false, 'Hotkey already exists')
            }
            this.hotkeyDict.set(hotkey.keys, hotkey)
            return createPromiseMessage(true, 'Hotkey added')
        }
        catch (e)
        {
            console.error((e as Error).message)
            return createPromiseMessage(false, 'Error adding hotkey')
        }
    }

    public addHotstringFromJson(jsonStringified: string, overwrite: boolean = false): Promise<string>
    {
        try
        {
            const hotstring: HotstringBuilder = HotstringBuilder.fromJson(JSON.parse(jsonStringified) as HotstringI)
            if (!overwrite && this.hotstringDict.has(hotstring.keys))
            {
                return createPromiseMessage(false, 'Hotstring already exists')
            }
            this.hotstringDict.set(hotstring.keys, hotstring)
            console.log(this.hotstringDict)
            return createPromiseMessage(true, 'Hotstring added')
        }
        catch (e)
        {
            console.error((e as Error).message)
            return createPromiseMessage(false, 'Error adding hotstring')
        }
    }

    public getHotkeys(): Promise<string>
    {
        try 
        {
            return createPromiseMessage(true, JSON.stringify(Array.from(this.hotkeyDict.values())))
        }
        catch (e)
        {
            console.error((e as Error).message)
            return createPromiseMessage(false, 'Error getting hotkeys')
        }
    }

    public getHotstrings(): Promise<string>
    {
        try
        {
            return createPromiseMessage(true, JSON.stringify(Array.from(this.hotstringDict.values())))
        }
        catch (e)
        {
            console.error((e as Error).message)
            return createPromiseMessage(false, 'Error getting hotstrings')
        }
    }

    public removeHotkey(keys: string): Promise<string>
    {
        try
        {
            this.hotkeyDict.delete(keys)
            return createPromiseMessage(true, `Hotkey '${keys}' removed`)
        }
        catch (e)
        {
            console.error((e as Error).message)
            return createPromiseMessage(false, `Error removing hotkey '${keys}'`)
        }
    }

    public removeHotstring(keys: string): Promise<string>
    {
        try
        {
            this.hotstringDict.delete(keys)
            return createPromiseMessage(true, `Hotstring '${keys}' removed`)
        }
        catch (e)
        {
            console.error((e as Error).message)
            return createPromiseMessage(false, `Error removing hotstring '${keys}'`)
        }
    }

    public run(): Promise<string>
    {
        try
        {
            this.cleanup()
            this.saveSCriptToFile()

            let pid: number = -1

            const proc = spawn(`"${this.ahkExecPath}"`, [`"${this.defaultCompiledScriptPath}"`], { shell: true })
            proc.stdout.on('data', (data) =>
            {
                console.log(`stdout: ${data}`)
            })
            proc.stderr.on('data', (data) =>
            {
                console.error(`stderr: ${data}`)
            })
            proc.on('exit', (code) =>
            {
                console.log(`AHK script exited with code ${code}`)
                this.procIds.set(pid, false)
                this.cleanup()
            })

            if (proc.pid)
            {
                this.procIds.set(proc.pid, true)
                this.keepAliveInterval = setInterval(() => this.broadcast(AhkMessage.KEEP_ALIVE), 2000)
                pid = proc.pid
                return createPromiseMessage(true, `${pid}`)
            }

            return createPromiseMessage(false, `${pid}`)
        }
        catch (e)
        {
            console.error((e as Error).message)
            return createPromiseMessage(false, 'Error running script')
        }
    }

    private saveSCriptToFile(): void
    {
        let script: string = readFileSync(defaultAhk, 'utf-8')
        for (const hotkey of this.hotkeyDict.values())
        {
            script += hotkey.buildAhk() + '\n\n'
        }
        for (const hotstring of this.hotstringDict.values())
        {
            script += hotstring.buildAhk() + '\n\n'
        }

        writeFileSync(this.defaultCompiledScriptPath, script)
    }

    public getStatus(): Promise<string>
    {
        try
        {
            for (const [pid, running] of this.procIds.entries()) {
                if (running) {
                    return createPromiseMessage(true, `${pid}`)
                }
            }
            return createPromiseMessage(true, '-1')
        }
        catch (e)
        {
            console.error((e as Error).message)
            return createPromiseMessage(false, 'Error getting status')
        }
    }
}