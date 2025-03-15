import { Hotkey, HotkeyI, Hotstring, HotstringI } from 'src/commons/ahk_objects'
import { IpcChannels, parsePromiseMessage, IpcMessage } from '../../../commons/common'

const ipc = window.electron.ipcRenderer

function IpcInvoke(channel: IpcChannels, ...args): Promise<IpcMessage>
{
    return ipc.invoke(channel, ...args).then((result: string) => parsePromiseMessage(result))
}

function IpcSend(channel: IpcChannels, jsonString: string = ''): void
{
    ipc.send(channel, jsonString)
}

function killAllAhkProcesses(): ReturnType<typeof IpcInvoke>
{
    return IpcInvoke(IpcChannels.KILL_ALL)
}

function runDefaultScript(): ReturnType<typeof IpcInvoke>
{
    return IpcInvoke(IpcChannels.RUN_DEFAULT)
}

function restartDefaultScript(): ReturnType<typeof IpcInvoke>
{
    return IpcInvoke(IpcChannels.RESTART)
}

function getHotkeys(): ReturnType<typeof IpcInvoke>
{
    return IpcInvoke(IpcChannels.GET_HOTKEYS)
}

function getHotstrings(): ReturnType<typeof IpcInvoke>
{
    return IpcInvoke(IpcChannels.GET_HOTSTRINGS)
}

function addHotkey(hotkey: Hotkey | HotkeyI, overwrite: boolean = false): ReturnType<typeof IpcInvoke>
{
    return IpcInvoke(IpcChannels.ADD_HOTKEY, JSON.stringify(hotkey), overwrite)
}

function addHotstring(hotstring: Hotstring | HotstringI, overwrite: boolean = false): ReturnType<typeof IpcInvoke>
{
    return IpcInvoke(IpcChannels.ADD_HOTSTRING, JSON.stringify(hotstring), overwrite)
}

function deleteHotstring(hotstring: string): ReturnType<typeof IpcInvoke>
{
    return IpcInvoke(IpcChannels.DELETE_HOTSTRING, hotstring)
}

function deleteHotkey(hotkey: string): ReturnType<typeof IpcInvoke>
{
    return IpcInvoke(IpcChannels.DELETE_HOTKEY, hotkey)
}

function getStatus(): ReturnType<typeof IpcInvoke>
{
    return IpcInvoke(IpcChannels.GET_STATUS)
}

export { killAllAhkProcesses, runDefaultScript, getHotkeys, getHotstrings, addHotkey, addHotstring, deleteHotstring, deleteHotkey, getStatus, restartDefaultScript }
export type promiseType = ReturnType<typeof IpcInvoke>