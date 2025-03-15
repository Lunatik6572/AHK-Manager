import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { IpcChannels } from '../commons/common'
import { AhkManager } from './autohotkey'



function createWindow(): void
{
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 850,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () =>
  {
    mainWindow.show()

    // Open the DevTools (F12) in development mode.
    if (is.dev)
    {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) =>
  {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL'])
  {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else
  {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() =>
{
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) =>
  {
    optimizer.watchWindowShortcuts(window)
  })

  const ahkManager: AhkManager = AhkManager.getInstance()

  ipcMain.handle(IpcChannels.GET_HOTSTRINGS, (_) =>
  {
    console.log('GET_HOTSTRINGS')
    return ahkManager.getHotstrings()
  })
  ipcMain.handle(IpcChannels.GET_HOTKEYS, (_) =>
  {
    console.log('GET_HOTKEYS')
    return ahkManager.getHotkeys()
  })
  ipcMain.handle(IpcChannels.ADD_HOTSTRING, (_, hotstring: string, overwrite: boolean) =>
  {
    console.log('ADD_HOTSTRING', hotstring, overwrite)
    return ahkManager.addHotstringFromJson(hotstring, overwrite)
  })
  ipcMain.handle(IpcChannels.ADD_HOTKEY, (_, hotkey) =>
  {
    console.log('ADD_HOTKEY', hotkey)
    // TODO: Implement add hotkey
    return new Promise((resolve) => { resolve('') })
  })
  ipcMain.handle(IpcChannels.EDIT_HOTSTRING, (_, hotstring) =>
  {
    console.log('EDIT_HOTSTRING', hotstring)
    // TODO: Implement edit hotstring
    return new Promise((resolve) => { resolve('') })
  })
  ipcMain.handle(IpcChannels.EDIT_HOTKEY, (_, hotkey) =>
  {
    console.log('EDIT_HOTKEY', hotkey)
    // TODO: Implement edit hotkey
    return new Promise((resolve) => { resolve('') })
  })
  ipcMain.handle(IpcChannels.DELETE_HOTSTRING, (_, hotstring) =>
  {
    console.log('DELETE_HOTSTRING', hotstring)
    return ahkManager.removeHotstring(hotstring)
  })
  ipcMain.handle(IpcChannels.DELETE_HOTKEY, (_, hotkey) =>
  {
    console.log('DELETE_HOTKEY', hotkey)
    return ahkManager.removeHotkey(hotkey)
  })
  ipcMain.handle(IpcChannels.RUN_DEFAULT, (_) =>
  {
    console.log('RUN_DEFAULT')
    return ahkManager.run()
  })
  ipcMain.handle(IpcChannels.KILL_ALL, (_) =>
  {
    console.log('KILL_ALL')
    return ahkManager.kill()
  })
  ipcMain.handle(IpcChannels.GET_STATUS, (_) =>
  {
    console.log('GET_STATUS')
    return ahkManager.getStatus()
  })
  ipcMain.handle(IpcChannels.RESTART, (_) =>
  {
    console.log('RESTART')
    return ahkManager.restart()
  })


  createWindow()

  app.on('activate', function ()
  {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () =>
{
  if (process.platform !== 'darwin')
  {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
