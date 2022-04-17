/*jshint esversion: 8 */

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
var projectPaths = {};

var createWindow = () => {
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
ipcMain.handle('dialog:openDirectory', async() => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (canceled) {
    return;
  } else {
    return filePaths[0];
  }
});

ipcMain.on("toMain", async(event, value) => {

  // Create Project
  if (value.name == 'project:create') {
    const filePath = value.data.path + `\\${value.data.name}\\`;
    fs.copy(path.join(__dirname) + '\\assets\\templates\\', filePath, function(err, data) {

      let rawdata = fs.readFileSync(filePath + "\\.eternal\\eternal.json");
      let json = JSON.parse(rawdata);
      json.id = makeid(30);
      json.projectTitle = value.data.name;
      fs.writeFileSync(filePath + "\\.eternal\\eternal.json", JSON.stringify(json, null, 2));

      let rawHtml = fs.readFileSync(filePath + "\\.eternal\\js\\main.js", 'utf8');

      fs.writeFileSync(filePath + "\\.eternal\\js\\main.js", rawHtml.toString().replace("'[[id]]'", `'${json.id}'`));
      console.log(json);
    });
    return;
  }

  // Render Them?
  if (value.name == 'project:render') {
    console.log(value.data);
    return;
  }


  // Open Project
  if (value.name == 'project:getID') {
    mainWindow.webContents.send('fromMain', {name: 'path', value: projectPaths[value.data]});
  }

  // Open Project
  if (value.name == 'project:open') {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (canceled) {
      return;
    } else {

      let rawdata = fs.readFileSync(filePaths[0] + "\\.eternal\\eternal.json");
      let json = JSON.parse(rawdata);


      mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
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
      mainWindow.loadFile(filePaths[0] + "\\" + json.main);
      mainWindow.show();
      mainWindow.webContents.openDevTools();

      projectPaths[json.id] = filePaths[0];
    }
    return;
  }

});

ipcMain.on("toProcess", async(event, value) => {
  if (value == 'screen:minimize') {
    mainWindow.minimize();
    return;
  }

  if (value == 'screen:exit') {
    app.quit();
    return;
  }
});


function makeid(length) {
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  while (true) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}



      // createWindow = new BrowserWindow({
      //   parent: mainWindow,
      //   webPreferences: {
      //     nodeIntegration: false,
      //     contextIsolation: true,
      //     enableRemoteModule: true,
      //     worldSafeExecuteJavaScript: true,
      //     preload: path.join(__dirname, "js/preload.js")
      //   }
      // });