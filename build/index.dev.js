"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/*jshint esversion: 8 */
var _require = require('electron'),
    app = _require.app,
    BrowserWindow = _require.BrowserWindow,
    ipcMain = _require.ipcMain,
    dialog = _require.dialog;

var path = require('path');

var Alert = require('electron-alert');

var fs = require('fs-extra');

var pretty = require('@financial-times/pretty');

app.disableHardwareAcceleration();
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'; // Handle creating/removing shortcuts on Windows when installing/uninstalling.

if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

var templateLocation = '\\template\\';
var mainWindow;
var projectPaths = {};

var createWindow = function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // minHeight: 600,
    // minWidth: 550,
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    icon: path.join(__dirname, "app.ico"),
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
app.on('window-all-closed', function () {
  // Quit when all windows are closed + macOS handler
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); // Functions

ipcMain.handle('dialog:openDirectory', function _callee() {
  var _ref, canceled, filePaths;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
          }));

        case 2:
          _ref = _context.sent;
          canceled = _ref.canceled;
          filePaths = _ref.filePaths;

          if (!canceled) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return");

        case 9:
          return _context.abrupt("return", filePaths[0]);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  });
});
ipcMain.on("toMain", function _callee2(event, value) {
  var filePath, fileData, saveData, projectPath, pagePath, urlName, dir, dirJson, origPath, _ref2, canceled, filePaths, rawdata, json, win, id, _filePath, _dir, _dirJson, _pagePath, _id, results, paths, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, result, rawPath, _id2, _id3, _results, _paths, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _result, _rawPath, _urlName, urlPath, _id4, _results2, _paths2, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _result2, _rawPath2, _id5, alert, resp;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!(value.name == 'project:create')) {
            _context2.next = 4;
            break;
          }

          filePath = value.data.path + "\\".concat(value.data.name, "\\");
          fs.copy(path.join(__dirname) + templateLocation, filePath, function (err, data) {
            var rawdata = fs.readFileSync(filePath + "\\.eternal\\eternal.json", 'utf8');
            var json = JSON.parse(rawdata);
            json.id = makeid(50);
            json.projectTitle = value.data.name;
            fs.writeFileSync(filePath + "\\.eternal\\eternal.json", JSON.stringify(json, null, 2), {
              encoding: 'utf-8'
            });
          });
          return _context2.abrupt("return");

        case 4:
          if (!(value.name == 'project:save')) {
            _context2.next = 34;
            break;
          }

          // Parse pageData
          fileData = "<script>\nwindow.pageData = " + JSON.stringify(value.pageData, null, 2);
          fileData += "\n\nwindow.profileData = " + JSON.stringify(value.profileData, null, 2) + "\n</script>"; // Parse ContentData

          saveData = pretty("<!-- File Data -->\n".concat(fileData, "\n\n<!-- File Content -->\n\n").concat(value.contentData)); // Get Infos
          // Absolute Path of Project Folder

          projectPath = value.projectPath + "\\"; // Absolute Path of Current Page

          pagePath = projectPath + value.info.pagePath.replace(/\//g, "\\"); // raw URL name of file

          urlName = value.pageData.urlName; // Save to Dir

          dir = fs.readFileSync(projectPath + ".eternal\\directory.json", 'utf8');
          dirJson = JSON.parse(dir); // Checks if rename

          if (value.info.originalName !== 'home' && value.info.isNewPage == false && value.info.originalName !== value.pageData.urlName) {
            delete dirJson[value.info.originalName];
            fs.unlinkSync(projectPath + value.info.originalPath.replace(/\//g, "\\"));
          } // Checks path integrity


          if (!dirJson.hasOwnProperty(urlName)) {
            _context2.next = 26;
            break;
          }

          origPath = projectPath + dirJson[urlName].path.replace(/\//g, '\\'); // Move Page if new path

          if (!fs.existsSync(origPath)) {
            _context2.next = 23;
            break;
          }

          if (!(dirJson.hasOwnProperty(urlName) && origPath != pagePath)) {
            _context2.next = 21;
            break;
          }

          fs.ensureDirSync(pagePath.replace("".concat(urlName, ".html"), ''));
          _context2.next = 21;
          return regeneratorRuntime.awrap(fs.move(origPath, pagePath));

        case 21:
          _context2.next = 24;
          break;

        case 23:
          fs.ensureFileSync(pagePath);

        case 24:
          _context2.next = 28;
          break;

        case 26:
          dirJson[urlName] = {};
          fs.ensureFileSync(pagePath);

        case 28:
          // Save Directory
          dirJson[urlName] = {
            "title": value.pageData.title,
            "path": value.info.pagePath,
            "parent": value.pageData.parent
          };
          fs.writeFileSync(projectPath + ".eternal\\directory.json", JSON.stringify(dirJson, null, 2), {
            encoding: 'utf-8'
          }); // Save Page

          fs.writeFileSync(pagePath, saveData, {
            encoding: 'utf-8'
          }); // Send signal that saving is done

          projectPaths[value.id].mainWindow.webContents.send('fromMain', {
            name: 'done-saving',
            value: null
          });
          console.log("saved!");
          return _context2.abrupt("return");

        case 34:
          if (!(value.name == 'project:open')) {
            _context2.next = 62;
            break;
          }

          _context2.next = 37;
          return regeneratorRuntime.awrap(dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
          }));

        case 37:
          _ref2 = _context2.sent;
          canceled = _ref2.canceled;
          filePaths = _ref2.filePaths;

          if (!canceled) {
            _context2.next = 42;
            break;
          }

          return _context2.abrupt("return");

        case 42:
          _context2.prev = 42;
          rawdata = fs.readFileSync(filePaths[0] + "\\.eternal\\eternal.json", 'utf8');
          _context2.next = 50;
          break;

        case 46:
          _context2.prev = 46;
          _context2.t0 = _context2["catch"](42);
          console.log("Project path is invalid");
          return _context2.abrupt("return");

        case 50:
          json = JSON.parse(rawdata);

          if (!projectPaths.hasOwnProperty(json.id)) {
            _context2.next = 54;
            break;
          }

          projectPaths[json.id].mainWindow.show();
          return _context2.abrupt("return");

        case 54:
          projectPaths[json.id] = {
            path: filePaths[0]
          }; // Create Window

          win = new BrowserWindow({
            width: 1200,
            height: 700,
            // autoHideMenuBar: true,
            // frame: false,
            // resizable: false,
            icon: path.join(__dirname, "app.ico"),
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true,
              enableRemoteModule: true,
              worldSafeExecuteJavaScript: true,
              preload: path.join(__dirname, "js/preload.js")
            }
          });
          win.on('close', function () {
            //   <---- Catch close event
            delete projectPaths[json.id];
          });
          win.loadFile(filePaths[0] + "\\" + json.main);
          win.show();
          win.webContents.openDevTools();
          projectPaths[json.id].mainWindow = win;
          return _context2.abrupt("return");

        case 62:
          if (!(value.name == 'project:update')) {
            _context2.next = 73;
            break;
          }

          id = value.id;
          _filePath = value.projectPath;
          _context2.next = 67;
          return regeneratorRuntime.awrap(fs.copy(path.join(__dirname) + "".concat(templateLocation, ".eternal\\css"), "".concat(_filePath, "\\.eternal\\css\\")));

        case 67:
          _context2.next = 69;
          return regeneratorRuntime.awrap(fs.copy(path.join(__dirname) + "".concat(templateLocation, ".eternal\\js"), "".concat(_filePath, "\\.eternal\\js\\")));

        case 69:
          _context2.next = 71;
          return regeneratorRuntime.awrap(fs.copyFile(path.join(__dirname) + "".concat(templateLocation, "index.html"), "".concat(_filePath, "\\index.html")));

        case 71:
          projectPaths[id].mainWindow.reload();
          return _context2.abrupt("return");

        case 73:
          if (!(value.name == 'project:deletepage')) {
            _context2.next = 90;
            break;
          }

          _dir = fs.readFileSync(value.data.projectPath + "\\.eternal\\directory.json", 'utf8');
          _dirJson = JSON.parse(_dir); // Move file to trash bin

          _pagePath = _dirJson[value.data.pageName].path;
          _context2.prev = 77;
          _context2.next = 80;
          return regeneratorRuntime.awrap(fs.move(value.data.projectPath + '\\' + _pagePath.replace(/\//g, '\\'), value.data.projectPath + "\\trash\\".concat(value.data.pageName, ".html")));

        case 80:
          _context2.next = 86;
          break;

        case 82:
          _context2.prev = 82;
          _context2.t1 = _context2["catch"](77);
          _context2.next = 86;
          return regeneratorRuntime.awrap(fs.move(value.data.projectPath + '\\' + _pagePath.replace(/\//g, '\\'), value.data.projectPath + "\\trash\\".concat(value.data.pageName, "-").concat(makeid(8), ".html")));

        case 86:
          // Delete file from directory
          delete _dirJson[value.data.pageName];
          fs.writeFileSync(value.data.projectPath + "\\.eternal\\directory.json", JSON.stringify(_dirJson, null, 2), {
            encoding: 'utf-8'
          });
          console.log("Deleted!");
          return _context2.abrupt("return");

        case 90:
          if (!(value.name == 'project:getcontentdirs')) {
            _context2.next = 125;
            break;
          }

          _id = value.id;
          results = getDirectoriesRecursive(value.projectPath + '\\content\\');
          paths = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context2.prev = 97;
          _iterator = results[Symbol.iterator]();

        case 99:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context2.next = 109;
            break;
          }

          result = _step.value;
          rawPath = result.split('content\\')[1].trim();

          if (!(rawPath == '')) {
            _context2.next = 105;
            break;
          }

          paths.push('content/');
          return _context2.abrupt("continue", 106);

        case 105:
          paths.push('content/' + rawPath.replace(/\\/g, '/') + '/');

        case 106:
          _iteratorNormalCompletion = true;
          _context2.next = 99;
          break;

        case 109:
          _context2.next = 115;
          break;

        case 111:
          _context2.prev = 111;
          _context2.t2 = _context2["catch"](97);
          _didIteratorError = true;
          _iteratorError = _context2.t2;

        case 115:
          _context2.prev = 115;
          _context2.prev = 116;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 118:
          _context2.prev = 118;

          if (!_didIteratorError) {
            _context2.next = 121;
            break;
          }

          throw _iteratorError;

        case 121:
          return _context2.finish(118);

        case 122:
          return _context2.finish(115);

        case 123:
          projectPaths[_id].mainWindow.webContents.send('fromMain', {
            name: 'urlpaths',
            value: paths
          });

          return _context2.abrupt("return");

        case 125:
          if (!(value.name == 'project:getpath')) {
            _context2.next = 129;
            break;
          }

          _id2 = value.id;

          projectPaths[_id2].mainWindow.webContents.send('fromMain', {
            name: 'projectpath',
            value: projectPaths[value.id].path
          });

          return _context2.abrupt("return");

        case 129:
          if (!(value.name == 'project:gettemplates')) {
            _context2.next = 154;
            break;
          }

          _id3 = value.id;
          _results = getFilesRecursive(value.projectPath + '\\assets\\templates\\');
          _paths = [];
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context2.prev = 136;

          for (_iterator2 = _results[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            _result = _step2.value;
            _rawPath = _result.split('templates\\')[1].trim();

            _paths.push(_rawPath.replace(/\\/g, '/').replace('.html', ''));
          }

          _context2.next = 144;
          break;

        case 140:
          _context2.prev = 140;
          _context2.t3 = _context2["catch"](136);
          _didIteratorError2 = true;
          _iteratorError2 = _context2.t3;

        case 144:
          _context2.prev = 144;
          _context2.prev = 145;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 147:
          _context2.prev = 147;

          if (!_didIteratorError2) {
            _context2.next = 150;
            break;
          }

          throw _iteratorError2;

        case 150:
          return _context2.finish(147);

        case 151:
          return _context2.finish(144);

        case 152:
          projectPaths[_id3].mainWindow.webContents.send('fromMain', {
            name: 'templateList',
            value: _paths
          });

          return _context2.abrupt("return");

        case 154:
          if (!(value.name == 'project:setastemplate')) {
            _context2.next = 184;
            break;
          }

          _urlName = value.urlName;
          urlPath = value.urlPath;
          _id4 = value.id; // Copy file to template folder

          _context2.next = 160;
          return regeneratorRuntime.awrap(fs.copy("".concat(value.projectPath, "\\").concat(urlPath.replace(/\//g, '\\')), "".concat(value.projectPath, "\\assets\\templates\\").concat(_urlName, ".html")));

        case 160:
          console.log('Template Saved!'); // Update template lists

          _results2 = getFilesRecursive(value.projectPath + '\\assets\\templates\\');
          _paths2 = [];
          _iteratorNormalCompletion3 = true;
          _didIteratorError3 = false;
          _iteratorError3 = undefined;
          _context2.prev = 166;

          for (_iterator3 = _results2[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            _result2 = _step3.value;
            _rawPath2 = _result2.split('templates\\')[1].trim();

            _paths2.push(_rawPath2.replace(/\\/g, '/').replace('.html', ''));
          }

          _context2.next = 174;
          break;

        case 170:
          _context2.prev = 170;
          _context2.t4 = _context2["catch"](166);
          _didIteratorError3 = true;
          _iteratorError3 = _context2.t4;

        case 174:
          _context2.prev = 174;
          _context2.prev = 175;

          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }

        case 177:
          _context2.prev = 177;

          if (!_didIteratorError3) {
            _context2.next = 180;
            break;
          }

          throw _iteratorError3;

        case 180:
          return _context2.finish(177);

        case 181:
          return _context2.finish(174);

        case 182:
          projectPaths[_id4].mainWindow.webContents.send('fromMain', {
            name: 'templateList',
            value: _paths2
          });

          return _context2.abrupt("return");

        case 184:
          if (!(value.name == 'dialog:alert')) {
            _context2.next = 193;
            break;
          }

          _id5 = value.id;
          alert = new Alert();
          _context2.next = 189;
          return regeneratorRuntime.awrap(alert.fireWithFrame(value.swalOptions, null, true, false));

        case 189:
          resp = _context2.sent;

          projectPaths[_id5].mainWindow.webContents.send('fromMain', {
            name: 'dialog:alert:response',
            value: resp.isConfirmed
          });

          console.log("res: ", resp);
          return _context2.abrupt("return");

        case 193:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[42, 46], [77, 82], [97, 111, 115, 123], [116,, 118, 122], [136, 140, 144, 152], [145,, 147, 151], [166, 170, 174, 182], [175,, 177, 181]]);
});
ipcMain.on("toProcess", function _callee3(event, value) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!(value == 'screen:minimize')) {
            _context3.next = 3;
            break;
          }

          mainWindow.minimize();
          return _context3.abrupt("return");

        case 3:
          if (!(value == 'screen:exit')) {
            _context3.next = 8;
            break;
          }

          if (!(Object.keys(projectPaths).length === 0)) {
            _context3.next = 7;
            break;
          }

          app.quit();
          return _context3.abrupt("return");

        case 7:
          mainWindow.close();

        case 8:
        case "end":
          return _context3.stop();
      }
    }
  });
});

function makeid(length) {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  while (true) {
    var result = '';

    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
} // Getting All folders in subdirectories


function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).map(function (file) {
    return path.join(srcpath, file);
  }).filter(function (path) {
    return fs.statSync(path).isDirectory();
  });
}

function getDirectoriesRecursive(srcpath) {
  return [srcpath].concat(_toConsumableArray(getDirectories(srcpath).map(getDirectoriesRecursive).reduce(function (a, b) {
    return a.concat(b);
  }, [])));
} // Getting all files in subdirectories


function getFilesRecursive(srcpath) {
  var files = [];
  fs.readdirSync(srcpath).forEach(function (file) {
    var Absolute = path.join(srcpath, file);
    if (fs.statSync(Absolute).isDirectory()) return ThroughDirectory(Absolute);else return files.push(Absolute);
  });
  return files;
}