import { Hotkey, Hotstring } from 'src/commons/ahk_objects'
import { IpcChannels } from '../../../commons/common'

const ipc = window.electron.ipcRenderer

function IpcInvoke(channel: IpcChannels, jsonString: string = ''): Promise<string>
{
    return ipc.invoke(channel, jsonString)
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

function addHotkey(hotkey: Hotkey): void
{
    IpcSend(IpcChannels.ADD_HOTKEY, JSON.stringify(hotkey))
}

function addHotstring(hotstring: Hotstring): void
{
    IpcSend(IpcChannels.ADD_HOTSTRING, JSON.stringify(hotstring))
}

export { IpcInvoke, IpcSend, killAllAhkProcesses, runDefaultScript, getHotkeys, getHotstrings }