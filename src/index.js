const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os-utils');
const fs = require('fs-extra');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

var mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // minHeight: 600,
    // minWidth: 550,
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
      worldSafeExecuteJavaScript: true,
      preload: path.join(__dirname, "js/preload.js")
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // Quit when all windows are closed + macOS handler
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Functions
// Placed right here

ipcMain.handle('dialog:openDirectory', async() => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
})

ipcMain.handle('electronCheck', async() => {
  console.log("YIEEH")
  return true
})


ipcMain.on("toMain", async(event, value) => {

  if (value.name == 'project:create') {
    const filePath = value.data.path + `\\${value.data.name}\\`
    fs.copy(path.join(__dirname) + '\\assets\\templates\\', filePath, function(err, data) {
      if (err) console.log(err);
    });
    return
  }

  if (value.name == 'project:open') {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    if (canceled) {
      return
    } else {
      let child = new BrowserWindow({
        parent: mainWindow,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: true,
          worldSafeExecuteJavaScript: true,
          preload: path.join(__dirname, "js/preload.js")
        }
      })
      child.loadFile(filePaths[0] + "\\index.html")
      child.show()
    }
    return
  }

});

ipcMain.on("toProcess", async(event, value) => {
  if (value == 'screen:minimize') {
    mainWindow.minimize()
    return
  }

  if (value == 'screen:exit') {
    app.quit()
    return
  }
})