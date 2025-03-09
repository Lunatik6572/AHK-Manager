import { Hotkey, HotkeyI, Hotstring, HotstringI } from 'src/commons/ahk_objects'
import { IpcChannels } from '../../../commons/common'

const ipc = window.electron.ipcRenderer

function IpcInvoke(channel: IpcChannels, ...args): Promise<string>
{
    return ipc.invoke(channel, ...args)
}

function IpcSend(channel: IpcChannels, jsonString: string = ''): void
{
    ipc.send(channel, jsonString)
}

function killAllAhkProcesses(): void
{
    IpcSend(IpcChannels.KILL_ALL)
}

function runDefaultScript(): void
{
    IpcSend(IpcChannels.RUN_DEFAULT)
}

function getHotkeys(): Promise<string>
{
    return IpcInvoke(IpcChannels.GET_HOTKEYS)
}

function getHotstrings(): Promise<string>
{
    return IpcInvoke(IpcChannels.GET_HOTSTRINGS)
}

function addHotkey(hotkey: Hotkey | HotkeyI, overwrite: boolean = false): Promise<string>
{
    return IpcInvoke(IpcChannels.ADD_HOTKEY, JSON.stringify(hotkey), overwrite)
}

function addHotstring(hotstring: Hotstring | HotstringI, overwrite: boolean = false): Promise<string>
{
    return IpcInvoke(IpcChannels.ADD_HOTSTRING, JSON.stringify(hotstring), overwrite)
}

export { killAllAhkProcesses, runDefaultScript, getHotkeys, getHotstrings, addHotkey, addHotstring }