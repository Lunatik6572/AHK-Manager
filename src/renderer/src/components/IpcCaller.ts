import { IpcChannels } from '../../../commons/common'

const ipc = window.electron.ipcRenderer

function IpcInvoke(channel: IpcChannels, ...args: never[]): Promise<unknown>
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

export { IpcInvoke, IpcSend, killAllAhkProcesses, runDefaultScript }