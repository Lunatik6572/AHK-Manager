class Dictionary<K extends string, V>
{
  private items: Record<K, V> = {} as Record<K, V>

  set(key: K, value: V): boolean
  {
    try
    {
      this.items[key] = value
      return true
    } catch
    {
      return false
    }
  }

  get(key: K): V | undefined
  {
    return this.items[key]
  }

  has(key: K): boolean
  {
    return key in this.items
  }

  delete(key: K): void
  {
    delete this.items[key]
  }

  forEach(callback: (key: K, value: V) => void): void
  {
    for (const key in this.items)
    {
      if (Object.prototype.hasOwnProperty.call(this.items, key))
      {
        callback(key as K, this.items[key])
      }
    }
  }
}

type IpcMessage = { success: boolean, message: string }

enum IpcChannels
{
  KILL_ALL = 'kill_all',
  ADD_HOTKEY = 'add_hotkey',
  ADD_HOTSTRING = 'add_hotstring',
  DELETE_HOTKEY = 'delete_hotkey',
  DELETE_HOTSTRING = 'delete_hotstring',
  EDIT_HOTKEY = 'edit_hotkey',
  EDIT_HOTSTRING = 'edit_hotstring',
  RUN_DEFAULT = 'run_default',
  GET_HOTKEYS = 'get_hotkeys',
  GET_HOTSTRINGS = 'get_hotstrings',
  GET_STATUS = 'get_status',
  RESTART = 'restart',
}

function createPromiseMessage(success: boolean, message: string = ''): Promise<string>
{
  return Promise.resolve(JSON.stringify({ success, message }))
}

function parsePromiseMessage(jsonString: string): IpcMessage
{
  let returnMessage: IpcMessage
  try
  {
    returnMessage = JSON.parse(jsonString)
    if (typeof returnMessage.success !== 'boolean' && typeof returnMessage.message !== 'string')
    {
      throw new Error('Invalid message format')
    }
  }
  catch (e)
  {
    returnMessage = { success: false, message: (e as Error).message }
  }

  return returnMessage
}

const AHK_LANGUAGE_ID = 'ahk_v2';

export { Dictionary, IpcChannels, createPromiseMessage, parsePromiseMessage, AHK_LANGUAGE_ID }
export type { IpcMessage } 