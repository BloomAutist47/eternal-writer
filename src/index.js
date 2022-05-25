/*jshint esversion: 8 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os-utils');
const fs = require('fs-extra');
const pretty = require('@financial-times/pretty');  

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

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
      json.id = makeid(50);
      json.projectTitle = value.data.name;
      fs.writeFileSync(filePath + "\\.eternal\\eternal.json", JSON.stringify(json, null, 2));
    });
    return;
  }

  // Save Project
  if (value.name == 'project:save') {

    let fileData = "<script>\nwindow.pageData = " + JSON.stringify(value.data.pageData, null, 2);
    fileData += "\n\nwindow.profileData = " + JSON.stringify(value.data.profileData, null, 2) + `\n</script>`;


    const saveData = pretty(`<!-- File Data -->\n${fileData}\n\n<!-- File Content -->\n\n${value.data.content}`);
    const path = value.data.path + "\\";
    const pageUrlPath = value.data.pageUrl.replace(/\//g, "\\");

    fs.ensureFileSync(path + pageUrlPath);
    fs.writeFileSync(path + pageUrlPath, saveData);

    // Save to Dir
    if (value.data.isNewPage) {
      const  dir = fs.readFileSync(path + "\\.eternal\\directory.json");
      let dirJson = JSON.parse(dir);
      dirJson[value.data.pageData.urlName] = {
        "title": value.data.pageData.title,
        "path": value.data.pageUrl,
        "parent": value.data.pageData.parent,
      };
      fs.writeFileSync(path + "\\.eternal\\directory.json", JSON.stringify(dirJson, null, 2));  
    }

    mainWindow.webContents.send('fromMain', {name: 'done-saving', value: null});
    console.log();

    return;
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
        width: 1200,///800,
        height: 800,
        // autoHideMenuBar: true,
        // frame: false,
        // resizable: false,
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
      // mainWindow.webContents.openDevTools();

      projectPaths[json.id] = filePaths[0];
      mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.send('fromMain', {name: 'path', value: filePaths[0]});
      });
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('fromMain', {name: 'path', value: filePaths[0]});
      });
    }
    return;
  }

  if (value.name == 'project:update') {

    const filePath = value.path;
    let target_path = path.join(__dirname) + '\\assets\\templates\\.eternal\\css';
    let file = `${filePath}\\.eternal\\`;
    console.log(target_path, file);
    fs.copy(path.join(__dirname) + '\\assets\\templates\\.eternal\\css', `${filePath}\\.eternal\\css\\`);
    fs.copy(path.join(__dirname) + '\\assets\\templates\\.eternal\\js', `${filePath}\\.eternal\\js\\`);
    fs.copyFile(path.join(__dirname) + '\\assets\\templates\\index.html', `${filePath}\\index.html`);
    return;
  }

  if (value.name == 'project:deletepage') {
    console.log(value.data);
    const dir = fs.readFileSync(value.data.projectPath  + "\\.eternal\\directory.json");
    let dirJson = JSON.parse(dir);

    // Move file to trash bin
    const pagePath = dirJson[value.data.pageName].path;
    console.log(value.data.projectPath + '\\' + pagePath.replace(/\//g, '\\'), value.data.projectPath + `\\trash\\${value.data.pageName}.html`);
    fs.move(value.data.projectPath + '\\' + pagePath.replace(/\//g, '\\'), value.data.projectPath + `\\trash\\${value.data.pageName}.html`);

    // Delete file from directory
    delete dirJson[value.data.pageName];
    fs.writeFileSync(value.data.projectPath + "\\.eternal\\directory.json", JSON.stringify(dirJson, null, 2));  

    return;
  }

  if (value.name == 'project:getcontentdirs') {
    const results = getDirectoriesRecursive(value.projectPath + '\\content\\');
    let paths = [];
    for (const result of results) {
      let rawPath = result.split('content\\')[1].trim();
      if (rawPath == '') {
        paths.push('content\\page-name.html');
        continue;
      }
      paths.push('content\\' + rawPath + '\\page-name.html');
    }

    mainWindow.webContents.send('fromMain', {name: 'urlpaths', value: paths});
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

function flatten(lists) {
  return lists.reduce((a, b) => a.concat(b), []);
}

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath)
    .map(file => path.join(srcpath, file))
    .filter(path => fs.statSync(path).isDirectory());
}

function getDirectoriesRecursive(srcpath) {
  return [srcpath, ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive))];
}