import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerProductsIpc } from './ipc/products'
import { registerUsersIpc } from './ipc/users'
import { registerInvoicesIpc } from './ipc/invoices'
import { registerAuthIpc } from './ipc/auth'
import { registerCategoriesIpc } from './ipc/categories'
import { registerSubCategoriesIpc } from './ipc/subCategories'
import { registerBrandsIpc } from './ipc/brands'
import { registerUnitsIpc } from './ipc/units'
import { registerCustomersIpc } from './ipc/customers'
import { registerSuppliersIpc } from './ipc/suppliers'
import { registerReturnsIpc } from './ipc/returns'
import { initDb } from './db'

function initializeIpc() {
  registerProductsIpc()
  registerUsersIpc()
  registerInvoicesIpc()
  registerCategoriesIpc()
  registerSubCategoriesIpc()
  registerBrandsIpc()
  registerUnitsIpc()
  registerSuppliersIpc()
  registerReturnsIpc()
  registerCustomersIpc()
  registerAuthIpc()
}

async function createWindow(): Promise<void> {
  // Initialize database first
  await initDb()

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Register IPC handlers
  initializeIpc()
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
