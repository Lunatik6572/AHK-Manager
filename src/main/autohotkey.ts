import { exec, execSync, spawn } from "child_process"
import { existsSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { Hotkey, HotkeyI, Hotstring, HotstringI, HotstringOptions } from "../commons/ahk_objects"

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
    options: HotstringOptions[]

    constructor(keys: string, action: string, options: HotstringOptions[] = [])
    {
        this.keys = keys
        this.action = action
        this.options = options  
    }

    public static fromJson(json): HotstringBuilder
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
    private static instance: AhkManager | undefined

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

    public static getInstance(): AhkManager | undefined
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
                AhkManager.instance = undefined
                return undefined
            }
        }
        return AhkManager.instance
    }

    public broadcast(message: AhkMessage, wParam:number = 0, lParam:number = 0, sync: boolean = false): void {
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

    public kill(): void
    {
        this.broadcast(AhkMessage.KILL, 9, 0)
        this.cleanup()
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

    public addHotkeyFromJson(jsonStringified, overwrite: boolean = false): boolean
    {
        try
        {
            const hotkey: HotkeyBuilder = HotkeyBuilder.fromJson(JSON.parse(jsonStringified))
            if (!overwrite && this.hotkeyDict.has(hotkey.keys))
            {
                return false
            }
            this.hotkeyDict.set(hotkey.keys, hotkey)
            return true
        }
        catch (e)
        {
            console.error((e as Error).message)
            return false
        }
    }

    public addHotstringFromJson(jsonStringified, overwrite: boolean = false): boolean
    {
        try
        {
            const hotstring: HotstringBuilder = HotstringBuilder.fromJson(JSON.parse(jsonStringified))
            if (!overwrite && this.hotstringDict.has(hotstring.keys))
            {
                return false
            }
            this.hotstringDict.set(hotstring.keys, hotstring)
            return true
        }
        catch (e)
        {
            console.error((e as Error).message)
            return false
        }
    }

    public removeHotkey(keys: string): void
    {
        this.hotkeyDict.delete(keys)
    }

    public removeHotstring(keys: string): void
    {
        this.hotstringDict.delete(keys)
    }

    public run(): void
    {
        this.cleanup()

        this.saveSCriptToFile()

        let pid: number = -1

        const proc = spawn(this.ahkExecPath, [this.defaultCompiledScriptPath], {shell: true})
        proc.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })
        proc.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`)
        })
        proc.on('exit', (code) => {
            console.log(`AHK script exited with code ${code}`)
            this.procIds.set(pid, false)
            this.cleanup()
        })

        if (proc.pid)
        {
            this.procIds.set(proc.pid, true)
            this.keepAliveInterval = setInterval(this.keepAlive, 2000)
            pid = proc.pid
        }
    }

    private saveSCriptToFile(): void
    {
        let script: string = ''
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
}