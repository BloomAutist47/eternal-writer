/*jshint esversion: 8 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os-utils');
const fs = require('fs-extra');
const pretty = require('@financial-times/pretty');  

app.disableHardwareAcceleration();

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

    // Parse pageData
    let fileData = "<script>\nwindow.pageData = " + JSON.stringify(value.pageData, null, 2);
    fileData += "\n\nwindow.profileData = " + JSON.stringify(value.profileData, null, 2) + `\n</script>`;

    // Parse ContentData
    const saveData = pretty(`<!-- File Data -->\n${fileData}\n\n<!-- File Content -->\n\n${value.contentData}`);

    // Get Infos
    // Absolute Path of Project Folder
    const projectPath = value.projectPath + "\\";
    // Absolute Path of Current Page
    const pagePath = projectPath + value.info.pagePath.replace(/\//g, "\\");
    // raw URL name of file
    const urlName = value.pageData.urlName;

    // Save to Dir
    const dir = fs.readFileSync(projectPath + ".eternal\\directory.json");
    let dirJson = JSON.parse(dir);

    if (dirJson.hasOwnProperty(urlName)) {
      const origPath = projectPath + dirJson[urlName].path.replace(/\//g, '\\');

      // Move Page if new path
      if (fs.existsSync(origPath)) {
        if (dirJson.hasOwnProperty(urlName) && origPath != pagePath) {
          fs.ensureDirSync(pagePath.replace(`${urlName}.html`, ''));
          await fs.move(origPath, pagePath);
        }
      } else {
        fs.ensureFileSync(pagePath);
      }
    } else {
      dirJson[urlName] = {};
      fs.ensureFileSync(pagePath);
    }

    // Save Directory
    dirJson[urlName] = {
      "title": value.pageData.title,
      "path": value.info.pagePath,
      "parent": value.pageData.parent,
    };

    fs.writeFileSync(projectPath + ".eternal\\directory.json", JSON.stringify(dirJson, null, 2));  
    
    // Save Page
    fs.writeFileSync(pagePath, saveData);

    // Send signal that saving is done
    projectPaths[value.id].mainWindow.webContents.send('fromMain', {name: 'done-saving', value: null});

    console.log("saved!");
    return;
  }

  // Open Project
  if (value.name == 'project:open') {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (canceled) {
      return;
    } 
    
    let rawdata = fs.readFileSync(filePaths[0] + "\\.eternal\\eternal.json");
    let json = JSON.parse(rawdata);
    
    if (projectPaths.hasOwnProperty(json.id)) {
      projectPaths[json.id].mainWindow.show();
      return;
    }

    projectPaths[json.id] = { path: filePaths[0]};

    // Create Window
    const win = new BrowserWindow({
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

    win.on('close', function() { //   <---- Catch close event
      delete projectPaths[json.id];
    });

    win.loadFile(filePaths[0] + "\\" + json.main);
    win.show();
    win.webContents.openDevTools();

    projectPaths[json.id].mainWindow = win;
  
    return;
  }

  if (value.name == 'project:update') {

    const id = value.id;
    const filePath = value.projectPath;
   
    await fs.copy(path.join(__dirname) + '\\assets\\templates\\.eternal\\css', `${filePath}\\.eternal\\css\\`);
    await fs.copy(path.join(__dirname) + '\\assets\\templates\\.eternal\\js', `${filePath}\\.eternal\\js\\`);
    await fs.copyFile(path.join(__dirname) + '\\assets\\templates\\index.html', `${filePath}\\index.html`);
    projectPaths[id].mainWindow.reload();
    return;
  }

  if (value.name == 'project:deletepage') {

    const dir = fs.readFileSync(value.data.projectPath  + "\\.eternal\\directory.json");
    let dirJson = JSON.parse(dir);

    // Move file to trash bin
    const pagePath = dirJson[value.data.pageName].path;
    fs.move(value.data.projectPath + '\\' + pagePath.replace(/\//g, '\\'), value.data.projectPath + `\\trash\\${value.data.pageName}.html`);

    // Delete file from directory
    delete dirJson[value.data.pageName];
    fs.writeFileSync(value.data.projectPath + "\\.eternal\\directory.json", JSON.stringify(dirJson, null, 2));  

    return;
  }

  if (value.name == 'project:getcontentdirs') {
    const id = value.id;
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

    projectPaths[id].mainWindow.webContents.send('fromMain', {name: 'urlpaths', value: paths});
    return;
  }

  if (value.name == 'project:getpath') {
    const id = value.id;
    projectPaths[id].mainWindow.webContents.send('fromMain', {name: 'projectpath', value: projectPaths[value.id].path});
    return;
  }

});

ipcMain.on("toProcess", async(event, value) => {
  if (value == 'screen:minimize') {
    mainWindow.minimize();
    return;
  }

  if (value == 'screen:exit') {
    if (Object.keys(projectPaths).length === 0) {
      app.quit();
      return;
    }
    mainWindow.close();
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