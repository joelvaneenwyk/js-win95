import { BrowserWindow, shell, HandlerDetails } from 'electron'

let mainWindow: BrowserWindow | null = null

export function getOrCreateWindow(): BrowserWindow {
  if (mainWindow) return mainWindow

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      sandbox: false,
      webviewTag: false,
      contextIsolation: false
    }
  })

  // mainWindow.webContents.toggleDevTools();
  mainWindow.loadFile('./dist/index.html')

  mainWindow.webContents.on('will-navigate', (event, url) =>
    handleNavigation(event, url)
  )

  // @joelvaneenwyk #review   Migrated from 'new-window' event to setWindowOpenHandler as the former
  //                          is deprecated. Need to review this more to ensure it is the right fix.
  //                #related  https://github.com/cypress-io/cypress/issues/24775
  mainWindow.webContents.setWindowOpenHandler((details: HandlerDetails) => {
    if (details.url.startsWith('http')) {
      shell.openExternal(details.url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

function handleNavigation(event: Electron.Event, url: string) {
  if (url.startsWith('http')) {
    event.preventDefault()
    shell.openExternal(url)
  }
}
