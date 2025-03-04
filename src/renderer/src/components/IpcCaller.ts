import { IpcChannels } from '../../../commons/common'

const ipc = window.electron.ipcRenderer

function IpcInvoke(channel: IpcChannels, ...args: never[]): Promise<string>
{
    return ipc.invoke(channel, ...args)
}

function IpcSend(channel: IpcChannels, ...args: never[]): void
{
    ipc.send(channel, ...args)
}

function killAllAhkProcesses(): void
{
    IpcSend(IpcChannels.KILL_ALL)
}

function runDefaultScript(): void
{
    IpcSend(IpcChannels.RUN_DEFAULT)
}

function getHotKeys(): Promise<string>
{
    return IpcInvoke(IpcChannels.GET_HOTKEYS)
}

function getHotStrings(): Promise<string>
{
    return IpcInvoke(IpcChannels.GET_HOTSTRINGS)
}

export { IpcInvoke, IpcSend, killAllAhkProcesses, runDefaultScript }