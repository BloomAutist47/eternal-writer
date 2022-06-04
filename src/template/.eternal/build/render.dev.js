"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*jshint esversion: 9 */
// Global Variables
var pageName = ''; // urlName of page

var pressedKey = '';
var idList = []; // ID list for the makeid() function

var root; // Reference to Vue App

var projectId = ''; // Long random id of project

var projectPath = ''; // Absolute path of project

/**
 * Start Page.
 *
 * Initiate creation of Vue App and rendering of page.
 *
 * @access     public
 * @see        TextRenderer
 */

function startPage() {
  document.addEventListener('keydown', function (e) {
    if (e.code != 'ControlLeft') return;
    pressedKey = 'ControlLeft';
  });
  document.addEventListener('keyup', function (e) {
    pressedKey = '';
  });
  var app = Vue.createApp({
    data: function data() {
      return {
        meta: {},
        dir: {},
        headerNavBtn: {},
        // Others
        areaToggle: getSpoilerStorageValue(),
        // Project Variables
        projectTitle: '',
        projectSubtitle: '',
        // Page Variables
        editorData: {},
        pageData: {},
        pageTitle: '',
        pageContents: {
          spoiler: [],
          nonspoiler: []
        },
        // Validator data
        isElectron: false,
        isNewPage: false,
        // Reload data
        rerenderData: {},
        pageHistory: [],
        // Autocomplete data
        urlpaths: [],
        parentlists: [],
        templateList: []
      };
    },
    methods: {
      /**
       * Electron Check.
       *
       * Sets this.isElectron to true if running on electron
       * and false if in browser reader mode.
       *
       * @access     private
       */
      isElectronCheck: function isElectronCheck() {
        var userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.indexOf(' electron/') == -1) {
          // Not electron
          console.log("Not on electron");
          this.isElectron = false;
          return;
        }

        this.isElectron = true; // Electron
      },

      /**
       * Spoiler Toggle Switcch Bool.
       *
       * sets this.areaToggle value.
       *
       * @access            private
       * @param {boolean}   checked  true/false.
       */
      areaToggleHandler: function areaToggleHandler(checked) {
        this.areaToggle = checked;
      },

      /**
       * Clear Variables.
       *
       * Resets key variables.
       *
       * @access     private
       */
      clearVars: function clearVars() {
        this.editorData = {};
        this.pageData = {};
        this.pageTitle = '';
        this.pageContents = {
          spoiler: [],
          nonspoiler: []
        };
      },

      /**
       * Get Page urlName.
       *
       * Get the current page urlName.
       *
       * @access           private
       * @return {string}  urlName.
       */
      getPageUrl: function getPageUrl() {
        if (!window.location.search) return 'home';
        var urlParams = new URLSearchParams(window.location.search);
        var url = urlParams.get('p').replace(/\s/g, "-");
        if (url) url.trim();
        return url;
      },

      /**
       * Clone Object.
       *
       * Simple deep copy of object.
       *
       * @access           private
       * @param {object}   obj  object to copy.
       */
      cloneObj: function cloneObj(obj) {
        return JSON.parse(JSON.stringify(obj));
      },

      /**
       * Capitalize
       *
       * Makes the first letter of string into an uppercase..
       *
       * @access           private
       * @param {string}   string  string to capitalize.
       */
      capitalize: function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      },

      /**
       * Update Project.
       *
       * Gets new css/js/index.html from template to update current project.
       *
       * @access     private
       */
      updateProject: function updateProject() {
        if (!this.isElectron) return;
        window.api.send('toMain', {
          name: 'project:update',
          id: this.meta.id,
          projectPath: projectPath
        });
      },
      setPageAsTemplate: function setPageAsTemplate() {
        if (!this.dir.hasOwnProperty(pageName)) {
          console.log("Can't turn non-existent page into a template");
          return;
        }

        window.api.send('toMain', {
          name: 'project:setastemplate',
          id: projectId,
          urlName: pageName,
          urlPath: this.dir[pageName].path,
          projectPath: projectPath
        });
      },

      /**
       * Load Previous History.
       *
       * Gets saved urlName in this.pageHistory and loads it.
       *
       * @access     private
       */
      historyPrevious: function historyPrevious() {
        return regeneratorRuntime.async(function historyPrevious$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.pageHistory.length === 1)) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                _context.next = 4;
                return regeneratorRuntime.awrap(this.readPage(this.pageHistory[this.pageHistory.length - 2]));

              case 4:
                this.pageHistory = this.pageHistory.slice(0, this.pageHistory.length - 2);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, null, this);
      },

      /**
       * Goto Page urlName.
       *
       * Function used by links to open a new page.
       *
       * @access           private
       * @param {string}   urlName  unique name id of url in directory. 
       */
      gotoPage: function gotoPage(urlName) {
        return regeneratorRuntime.async(function gotoPage$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(this.isElectron !== true && pressedKey == 'ControlLeft')) {
                  _context2.next = 3;
                  break;
                }

                window.open(window.location.origin + "?p=" + urlName, '_blank').focus();
                return _context2.abrupt("return");

              case 3:
                _context2.next = 5;
                return regeneratorRuntime.awrap(this.readPage(urlName));

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, null, this);
      },

      /**
       * Delete Page.
       *
       * Sends instructions to electron to delete a page.
       * Then sends user back to homepage.
       *
       * @access     private
       */
      deletePage: function deletePage() {
        return regeneratorRuntime.async(function deletePage$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.isElectron) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt("return");

              case 2:
                if (!(pageName === 'home')) {
                  _context3.next = 4;
                  break;
                }

                return _context3.abrupt("return");

              case 4:
                // Deletes page from directory
                delete this.dir[pageName]; // code to move file into trash bin

                _context3.next = 7;
                return regeneratorRuntime.awrap(window.api.send('toMain', {
                  name: 'project:deletepage',
                  data: {
                    pageName: pageName,
                    projectPath: projectPath
                  }
                }));

              case 7:
                _context3.next = 9;
                return regeneratorRuntime.awrap(this.readPage('home'));

              case 9:
                document.getElementById('sidebar').classList.add('hide'); // Updates Lists

                this.parentlists = Object.keys(this.dir); // Updates urlPath autocomplete data

                _context3.next = 13;
                return regeneratorRuntime.awrap(window.api.send('toMain', {
                  name: 'project:getcontentdirs',
                  id: projectId,
                  projectPath: projectPath
                }));

              case 13:
              case "end":
                return _context3.stop();
            }
          }
        }, null, this);
      },
      deletePageConfirm: function deletePageConfirm() {
        return regeneratorRuntime.async(function deletePageConfirm$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (this.isElectron) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return");

              case 2:
                if (!(pageName === 'home')) {
                  _context4.next = 5;
                  break;
                }

                sendToMain('dialog:alert', null, {
                  swalOptions: {
                    title: "Home Page cannot be deleted",
                    text: "This is the most important page of your project.",
                    icon: "warning",
                    showCancelButton: false
                  }
                });
                return _context4.abrupt("return");

              case 5:
                if (this.dir.hasOwnProperty(pageName)) {
                  _context4.next = 8;
                  break;
                }

                console.log("Cannot Delete nonexistent page");
                return _context4.abrupt("return");

              case 8:
                sendToMain('dialog:alert', 'response:delete', {
                  swalOptions: {
                    title: "Are you sure you want to delete this page?",
                    text: "You can still find it in the trash folder if you changed your mind",
                    icon: "warning",
                    showCancelButton: true
                  }
                });

              case 9:
              case "end":
                return _context4.stop();
            }
          }
        }, null, this);
      },

      /**
       * Create New Page.
       *
       * Create new page to save.
       *
       * @access     private
       */
      newPage: function newPage(selectedTemplate) {
        return regeneratorRuntime.async(function newPage$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                pageName = 'new-page';
                window.history.replaceState(null, null, "?p=new-page");
                this.clearVars();
                console.log('Template: ', selectedTemplate);

                if (!(selectedTemplate == '')) {
                  _context5.next = 9;
                  break;
                }

                _context5.next = 7;
                return regeneratorRuntime.awrap(this.renderPage('pageNull', 'assets/new-page.html', true));

              case 7:
                _context5.next = 11;
                break;

              case 9:
                _context5.next = 11;
                return regeneratorRuntime.awrap(this.renderPage('pageNull', "assets/templates/".concat(selectedTemplate, ".html"), true));

              case 11:
                document.getElementById('sidebar').classList.add('hide');

              case 12:
              case "end":
                return _context5.stop();
            }
          }
        }, null, this);
      },

      /**
       * Saves Edited Content.
       *
       * Sends file to electron to save into an html.
       *
       * @access           private
       * @param {object}   data  object containing pageData, pageProfile, and pageContent.
       */
      saveContent: function saveContent(data) {
        var pagePath, originalPath;
        return regeneratorRuntime.async(function saveContent$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (this.isElectron) {
                  _context6.next = 2;
                  break;
                }

                return _context6.abrupt("return");

              case 2:
                // Ensures home
                if (pageName === 'home' & data.pageData.urlName !== 'home') {
                  data.pageData.urlName = 'home';
                } // Creates URLpath with urlName.html at the end /


                pagePath = data.pageData.urlPath.slice().trim();

                if (pagePath.charAt(pagePath.length - 1) != '/') {
                  pagePath += '/';
                }

                originalPath = pagePath.slice() + pageName.replace(/\s/g, '-') + '.html';
                pagePath += data.pageData.urlName.replace(/\s/g, '-') + '.html'; // Send to electron

                _context6.next = 9;
                return regeneratorRuntime.awrap(window.api.send('toMain', {
                  name: 'project:save',
                  id: this.meta.id,
                  projectPath: projectPath,
                  info: {
                    pagePath: pagePath,
                    originalPath: originalPath,
                    originalName: pageName.replace(/\s/g, '-'),
                    isNewPage: this.isNewPage
                  },
                  contentData: data.contentData,
                  pageData: this.cloneObj(data.pageData),
                  profileData: this.cloneObj(data.profileData)
                }));

              case 9:
                // Rename
                if (pageName !== 'new-page' && this.dir.hasOwnProperty(pageName) && pageName !== data.pageData.urlName) {
                  delete this.dir[pageName];
                } // Saves to directory


                this.dir[data.pageData.urlName] = {
                  "title": data.pageData.title,
                  "path": pagePath,
                  "parent": data.pageData.parent
                }; // Updates Parent lists

                this.parentlists = Object.keys(this.dir); // Updates urlPath autocomplete data

                _context6.next = 14;
                return regeneratorRuntime.awrap(window.api.send('toMain', {
                  name: 'project:getcontentdirs',
                  id: projectId,
                  projectPath: projectPath
                }));

              case 14:
                // Saves for rerender
                this.clearVars();
                _context6.next = 17;
                return regeneratorRuntime.awrap(this.$nextTick());

              case 17:
                this.rerenderData = data;
                pageName = data.pageData.urlName;

              case 19:
              case "end":
                return _context6.stop();
            }
          }
        }, null, this);
      },

      /**
       * Rerenders page.
       *
       * After electron confirms the page has been saved
       * this function will rerender the saved data.
       *
       * @access     public
       */
      rerenderPage: function rerenderPage() {
        return regeneratorRuntime.async(function rerenderPage$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return regeneratorRuntime.awrap(this.renderPage('rerender', this.rerenderData));

              case 2:
                this.rerenderData = {};

              case 3:
              case "end":
                return _context7.stop();
            }
          }
        }, null, this);
      },

      /**
       * Read Page.
       *
       * Reads page and do a validation check before rendering it.
       *
       * @access           private
       * @param {string}   urlName  name of page in dir.
       */
      readPage: function readPage(urlName) {
        return regeneratorRuntime.async(function readPage$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                pageName = urlName.replace(/\s/g, '-').trim();

                if (pageName !== 'home') {
                  window.history.replaceState(null, null, "?p=".concat(pageName));
                } else {
                  window.history.replaceState(null, null, window.location.pathname);
                }

                this.clearVars();

                if (this.dir.hasOwnProperty(pageName)) {
                  _context8.next = 13;
                  break;
                }

                _context8.prev = 4;
                _context8.next = 7;
                return regeneratorRuntime.awrap(this.renderPage('pageNull', 'assets/page-not-found.html'));

              case 7:
                _context8.next = 12;
                break;

              case 9:
                _context8.prev = 9;
                _context8.t0 = _context8["catch"](4);
                console.log(_context8.t0);

              case 12:
                return _context8.abrupt("return");

              case 13:
                _context8.next = 15;
                return regeneratorRuntime.awrap(this.renderPage('normal', this.dir[pageName].path));

              case 15:
              case "end":
                return _context8.stop();
            }
          }
        }, null, this, [[4, 9]]);
      },
      fetchHTML: function fetchHTML(src) {
        var response, text;
        return regeneratorRuntime.async(function fetchHTML$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return regeneratorRuntime.awrap(fetch(src));

              case 2:
                response = _context9.sent;

                if (!(response.status === 400)) {
                  _context9.next = 5;
                  break;
                }

                return _context9.abrupt("return", null);

              case 5:
                _context9.next = 7;
                return regeneratorRuntime.awrap(response.text());

              case 7:
                text = _context9.sent;
                text.replace(/&gt;/gm, '>');
                return _context9.abrupt("return", text);

              case 10:
              case "end":
                return _context9.stop();
            }
          }
        });
      },

      /**
       * Render Page.
       *
       * Actually does the rendering of the page.
       *
       * @access           private
       * @param {string}   mode  'normal', 'pageNull', or 'rerender'
       * @param {string}   data  urlName or urlPath if null
       */
      renderPage: function renderPage(mode, data) {
        var _this = this;

        var isNewPage,
            pageRaw,
            pageFile,
            editorContentDataTemp,
            parsedContent,
            content,
            areas,
            _i,
            _areas,
            _area,
            areaDiv,
            _iteratorNormalCompletion2,
            _didIteratorError2,
            _iteratorError2,
            _iterator2,
            _step2,
            _item,
            itemHtml,
            textRenderer,
            editorDataTemp,
            area,
            _iteratorNormalCompletion,
            _didIteratorError,
            _iteratorError,
            _iterator,
            _step,
            item,
            _args10 = arguments;

        return regeneratorRuntime.async(function renderPage$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                isNewPage = _args10.length > 2 && _args10[2] !== undefined ? _args10[2] : false;
                // Step 3. Set Page General Data
                this.headerNavBtn = this.meta.headerNavigation;
                this.projectTitle = this.meta.projectTitle;
                this.projectSubtitle = this.meta.projectSubtitle;
                this.areaToggle = getSpoilerStorageValue();
                pageRaw = '';
                document.getElementById('projectTitle').innerText = this.projectTitle;
                _context10.t0 = mode;
                _context10.next = _context10.t0 === 'normal' ? 10 : _context10.t0 === 'pageNull' ? 29 : _context10.t0 === 'rerender' ? 40 : 44;
                break;

              case 10:
                _context10.prev = 10;
                _context10.next = 13;
                return regeneratorRuntime.awrap(this.fetchHTML(data));

              case 13:
                pageFile = _context10.sent;

                if (!(pageFile == null)) {
                  _context10.next = 18;
                  break;
                }

                _context10.next = 17;
                return regeneratorRuntime.awrap(this.renderPage('pageNull', 'assets/page-not-found.html'));

              case 17:
                return _context10.abrupt("return");

              case 18:
                _context10.next = 25;
                break;

              case 20:
                _context10.prev = 20;
                _context10.t1 = _context10["catch"](10);
                _context10.next = 24;
                return regeneratorRuntime.awrap(this.renderPage('pageNull', 'assets/page-not-found.html'));

              case 24:
                return _context10.abrupt("return");

              case 25:
                pageRaw = pageFile.trim().split("<!-- File Content -->"); // Step 5. Processing Window Variables

                loadScripts(pageRaw[0]);
                this.isNewPage = false;
                return _context10.abrupt("break", 44);

              case 29:
                _context10.next = 31;
                return regeneratorRuntime.awrap(this.fetchHTML(data));

              case 31:
                _context10.t2 = pageName;
                pageFile = _context10.sent.replace('[[pageName]]', _context10.t2);
                pageRaw = pageFile.trim().split("<!-- File Content -->"); // Step 5. Processing Window Variables

                loadScripts(pageRaw[0]);
                window.pageData.title = this.capitalize(pageName.replace(/\-/g, " ")).trim();
                window.pageData.urlName = pageName.trim().toLowerCase().replace(/\s/g, '-');
                if (isNewPage) window.pageData.urlName += '-' + makeid(5);
                this.isNewPage = true;
                return _context10.abrupt("break", 44);

              case 40:
                window.profileData = data.profileData;
                window.pageData = data.pageData;
                this.isNewPage = false;
                return _context10.abrupt("break", 44);

              case 44:
                // Step 6. Set Page Specific Data
                this.pageData = window.pageData;
                this.pageTitle = window.pageData.title;
                this.pageParent = window.pageData.parent;
                editorContentDataTemp = {}; // Step 7. Process Contents

                parsedContent = {};

                if (mode == 'rerender') {
                  parsedContent = parseHTML(data.contentData);
                } else {
                  parsedContent = parseHTML(pageRaw[1]);
                }

                content = []; // Separating Each Part

                areas = ['spoiler', 'nonspoiler'];
                _i = 0, _areas = areas;

              case 53:
                if (!(_i < _areas.length)) {
                  _context10.next = 80;
                  break;
                }

                _area = _areas[_i];
                areaDiv = parsedContent.getElementById(_area);

                if (areaDiv) {
                  _context10.next = 58;
                  break;
                }

                return _context10.abrupt("continue", 77);

              case 58:
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context10.prev = 61;

                for (_iterator2 = areaDiv.querySelectorAll('.page-tab')[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  _item = _step2.value;
                  itemHtml = superTrim(_item.innerHTML.replace(/&gt;/gm, '>'));
                  editorContentDataTemp[_item.id] = itemHtml;
                  content.push("<div id=\"".concat(_item.id, "\" class=\"page-tag\">\n") + itemHtml + "\n</div>");
                }

                _context10.next = 69;
                break;

              case 65:
                _context10.prev = 65;
                _context10.t3 = _context10["catch"](61);
                _didIteratorError2 = true;
                _iteratorError2 = _context10.t3;

              case 69:
                _context10.prev = 69;
                _context10.prev = 70;

                if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                  _iterator2["return"]();
                }

              case 72:
                _context10.prev = 72;

                if (!_didIteratorError2) {
                  _context10.next = 75;
                  break;
                }

                throw _iteratorError2;

              case 75:
                return _context10.finish(72);

              case 76:
                return _context10.finish(69);

              case 77:
                _i++;
                _context10.next = 53;
                break;

              case 80:
                textRenderer = new TextRenderer(this.dir); // Step 8. Add Contents to render

                content.forEach(function (item, index) {
                  // Adding them to the tab
                  var data = getPageData(item);
                  var profileBox = {};

                  if (window.profileData.hasOwnProperty(data.data.id)) {
                    profileBox = window.profileData[data.data.id];
                  }

                  _this.pageContents[data.type].push(_objectSpread({
                    html: textRenderer.renderText(item, data.type),
                    profileBox: profileBox
                  }, data.data));
                });
                editorDataTemp = {
                  pageData: window.pageData,
                  profileData: window.profileData,
                  contentData: JSON.parse(JSON.stringify(this.pageContents))
                };
                _context10.t4 = regeneratorRuntime.keys(editorDataTemp.contentData);

              case 84:
                if ((_context10.t5 = _context10.t4()).done) {
                  _context10.next = 107;
                  break;
                }

                area = _context10.t5.value;
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context10.prev = 89;

                for (_iterator = editorDataTemp.contentData[area][Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  item = _step.value;
                  item.html = editorContentDataTemp[item.id];
                  delete item.profileBox;
                }

                _context10.next = 97;
                break;

              case 93:
                _context10.prev = 93;
                _context10.t6 = _context10["catch"](89);
                _didIteratorError = true;
                _iteratorError = _context10.t6;

              case 97:
                _context10.prev = 97;
                _context10.prev = 98;

                if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                  _iterator["return"]();
                }

              case 100:
                _context10.prev = 100;

                if (!_didIteratorError) {
                  _context10.next = 103;
                  break;
                }

                throw _iteratorError;

              case 103:
                return _context10.finish(100);

              case 104:
                return _context10.finish(97);

              case 105:
                _context10.next = 84;
                break;

              case 107:
                this.editorData = editorDataTemp;
                console.log(this.editorData); // Tape and Stapler solution. I have no fucking idea why the nonspoiler div gets hidden at the start
                // when you opened a spoiler=true page from a link.

                if (this.areaToggle == false) {
                  document.getElementById('nonspoiler').classList.remove('hide');
                }

                this.pageHistory.push(pageName);

              case 111:
              case "end":
                return _context10.stop();
            }
          }
        }, null, this, [[10, 20], [61, 65, 69, 77], [70,, 72, 76], [89, 93, 97, 105], [98,, 100, 104]]);
      },

      /**
       * Create Script (floating status).
       *
       * Loads a script from src and adds it to page.
       *
       * @access           private
       * @param {string}   src  script src url.
       */
      createScript: function createScript(src) {
        fetch(src).then(function (data) {
          data.text().then(function (r) {
            eval(r); // jshint ignore:line
          });
        });
      }
    },
    created: function created() {
      var _this2 = this;

      return regeneratorRuntime.async(function created$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              this.isElectronCheck(); // this.createScript(".eternal/js/editor/codeflask.min.js");
              // this.createScript(".eternal/js/editor/jsoneditor.js");
              // this.createScript(".eternal/js/editor/easymde.min.js");
              // Creates API receive listener

              try {
                window.api.receive("fromMain", function _callee(data) {
                  return regeneratorRuntime.async(function _callee$(_context11) {
                    while (1) {
                      switch (_context11.prev = _context11.next) {
                        case 0:
                          if (!(data.name == 'projectpath')) {
                            _context11.next = 10;
                            break;
                          }

                          if (!(projectPath != '')) {
                            _context11.next = 3;
                            break;
                          }

                          return _context11.abrupt("return");

                        case 3:
                          projectPath = data.value;
                          console.log("Path: ", projectPath); // Get urlPath autocomplete data

                          _context11.next = 7;
                          return regeneratorRuntime.awrap(window.api.send('toMain', {
                            name: 'project:getcontentdirs',
                            id: projectId,
                            projectPath: projectPath
                          }));

                        case 7:
                          _context11.next = 9;
                          return regeneratorRuntime.awrap(window.api.send('toMain', {
                            name: 'project:gettemplates',
                            id: projectId,
                            projectPath: projectPath
                          }));

                        case 9:
                          return _context11.abrupt("return");

                        case 10:
                          if (!(data.name == 'done-saving')) {
                            _context11.next = 15;
                            break;
                          }

                          console.log('Rerendering');
                          _context11.next = 14;
                          return regeneratorRuntime.awrap(_this2.rerenderPage());

                        case 14:
                          return _context11.abrupt("return");

                        case 15:
                          if (!(data.name == 'urlpaths')) {
                            _context11.next = 18;
                            break;
                          }

                          _this2.urlpaths = data.value;
                          return _context11.abrupt("return");

                        case 18:
                          if (!(data.name == 'templateList')) {
                            _context11.next = 21;
                            break;
                          }

                          _this2.templateList = data.value;
                          return _context11.abrupt("return");

                        case 21:
                          if (!(data.name == 'response:delete')) {
                            _context11.next = 26;
                            break;
                          }

                          if (!(data.value == true)) {
                            _context11.next = 25;
                            break;
                          }

                          _context11.next = 25;
                          return regeneratorRuntime.awrap(_this2.deletePage());

                        case 25:
                          return _context11.abrupt("return");

                        case 26:
                        case "end":
                          return _context11.stop();
                      }
                    }
                  });
                });
              } catch (error) {}

            case 2:
            case "end":
              return _context12.stop();
          }
        }
      }, null, this);
    },
    mounted: function mounted() {
      var metaRes, dirRes;
      return regeneratorRuntime.async(function mounted$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return regeneratorRuntime.awrap(fetch(".eternal/eternal.json"));

            case 2:
              metaRes = _context13.sent;
              _context13.next = 5;
              return regeneratorRuntime.awrap(metaRes.json());

            case 5:
              this.meta = _context13.sent;
              _context13.next = 8;
              return regeneratorRuntime.awrap(fetch(".eternal/directory.json"));

            case 8:
              dirRes = _context13.sent;
              _context13.next = 11;
              return regeneratorRuntime.awrap(dirRes.json());

            case 11:
              this.dir = _context13.sent;
              projectId = this.meta.id; // Save list for parent metada automcomplete data

              this.parentlists = Object.keys(this.dir); // Gets urlName

              pageName = this.getPageUrl(); // Read and renders page

              _context13.next = 17;
              return regeneratorRuntime.awrap(this.readPage(pageName));

            case 17:
              if (!this.isElectron) {
                _context13.next = 20;
                break;
              }

              _context13.next = 20;
              return regeneratorRuntime.awrap(window.api.send('toMain', {
                name: 'project:getpath',
                id: this.meta.id
              }));

            case 20:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this);
    }
  }); // Register Components

  app.component(btn.name, btn);
  app.component(btntoggle.name, btntoggle);
  app.component(header.name, header);
  app.component(pageContent.name, pageContent);
  app.component(tab.name, tab);
  app.component(toggle.name, toggle);
  app.component(breadcrumbs.name, breadcrumbs);
  app.component(profilebox.name, profilebox);
  app.component(tabs.name, tabs);
  app.component(editor.name, editor);
  app.component(sideBar.name, sideBar);
  app.component(metaEditor.name, metaEditor);
  app.component(tabEditor.name, tabEditor);
  app.component(contentEditor.name, contentEditor);
  app.component(profileEditor.name, profileEditor);
  app.component(textInput.name, textInput);
  app.component(selectDrop.name, selectDrop);
  app.component(dropdown.name, dropdown); // Mount

  root = app.mount('#app');
}

function sendToMain(name, responseName, value) {
  window.api.send('toMain', _objectSpread({
    name: name,
    id: projectId,
    projectPath: projectPath,
    responseName: responseName
  }, value));
}
/**
 * Get Page Data.
 *
 * Gets value of div tab, the id, pageid, and name.
 *
 * @access          public
 * @return {Object} Aan obj with {type, data: {id, pageid, name }} format.
 */


function getPageData(html) {
  var id = html.match(/<div id=\"(.+?)\"/)[1];
  return {
    type: window.pageData.tabs[id].area,
    data: {
      id: id,
      pageid: id + '-page',
      name: window.pageData.tabs[id].name
    }
  };
}
/**
 * Get Spoiler Storage Value.
 *
 * Gets value of spoiler switch from local storage
 *
 * @access            public
 * @return {Boolean}  true = spoiler is turned on. false = turned off.
 */


function getSpoilerStorageValue() {
  if (localStorage.theSongOfEnderion_isSpoiler === 'true') return true;else return false;
}
/**
 * Parse HTML String.
 *
 * Parses an HTML string into a Node object.
 *
 * @access           public
 * @param {string}   html   html string.
 * @return {Node}           a node with the parsed html string.
 */


function parseHTML(html) {
  var t = document.createElement('template');
  t.innerHTML = html;
  return t.content.cloneNode(true);
}
/**
 * Load Page HTML Script Variables.
 *
 * Parses the string \<script\> tag of the page html and
 * evaluates it so you can use its vars and funcs.
 *
 * @access     private
 * @param {string}   scriptData  string of the \<script\> 
 */


function loadScripts(scriptData) {
  var parsedData = parseHTML(scriptData);
  var scripts = parsedData.querySelectorAll("script");
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = scripts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var script = _step3.value;

      if (script.innerText) {
        eval(script.innerText); // jshint ignore:line
      } else if (script.src) {
        fetch(script.src).then(function (data) {
          data.text().then(function (r) {
            eval(r); // jshint ignore:line
          });
        });
      } // To not repeat the element


      script.parentNode.removeChild(script);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
        _iterator3["return"]();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
}
/**
 * Supre trim string.
 *
 * Removes excess white space on every line in a 
 * multi-line string.
 * 
 * @access     public
 * @param {string}   text  string to remove white space.
 * @return {string}        processed string.
 */


function superTrim(text) {
  var content = text.trim().split("\n");
  var result = "";
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = content[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var con = _step4.value;
      result += "".concat(con.trim(), "\n");
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
        _iterator4["return"]();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  return result;
}
/**
 * Text Renderer.
 *
 * Renders text and converts it from markdown to html.
 * 
 * @access     public
 */


var TextRenderer =
/*#__PURE__*/
function () {
  function TextRenderer(dir) {
    _classCallCheck(this, TextRenderer);

    this.headerConvertionTable = {
      '# ': 'h1',
      '## ': 'h2',
      '### ': 'h3',
      '#### ': 'h4',
      '##### ': 'h5',
      '###### ': 'h6'
    };
    this.renderTOC = false;
    this.dir = dir;
  }
  /**
   * Render Markdown Text
   *
   * Parses the markdown content of the html string and
   * applies markdown rules as well as custom rendering.
   *
   * @access     public
   * @param {string}   htmlContentString   raw string content of the html
   * @param {string}   area                'spoiler' or 'nonspoiler'
   */


  _createClass(TextRenderer, [{
    key: "renderText",
    value: function renderText(htmlContentString, area) {
      // Checks if toc is enabled in current page.
      if (htmlContentString.includes("[[toc]]")) {
        this.renderTOC = true;
      } // String split into multilines.


      var lines = htmlContentString.trim().split("\n"); // Variables

      var htmlContent = ''; // Final Processed content

      var TOClist = {}; // Table of Contents

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = lines[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var line = _step5.value;
          var value = line.trim();

          if (value == "") {
            htmlContent += '<p class="space"></p>';
            continue;
          } // Formats


          value = this.renderWordBold(value);
          value = this.renderWordItalic(value); // Link

          value = this.renderLink(value); // List

          if (value.startsWith("* ")) {
            htmlContent += "<li>".concat(value.replace("* ", "").trim(), "</li>\n");
            continue;
          } // Quote Block


          if (value.startsWith("> ")) {
            var rawSplit = value.split("-");
            var text = rawSplit[0].replace("> ", '');
            var author = '';

            if (typeof rawSplit[1] != 'undefined') {
              author = "<br><span class=\"font--small float-end pe-3\">- ".concat(rawSplit[1], "</span>");
            }

            htmlContent += "\n        <div class=\"center\">\n          <span class=\"quote\">\n            <span class=\"quote-marks font--larger\"><b>\u201C</b></span>\n              ".concat(text, "\n            <span class=\"quote-marks\"><b>\u201D</b></span>\n            ").concat(author, "\n          </span>\n        </div>\n");
            continue;
          } // Headers


          var hres = value.match(/(#+)\s/);

          if (hres) {
            var h = this.headerConvertionTable[hres[0]];

            if (this.renderTOC) {
              var value_ = value.replace(hres[0], "");
              var id = "".concat(area, "-").concat(value_.replace(/\s/g, "-").toLowerCase());

              if (idList.includes(id)) {
                id += makeid(5);
              }

              htmlContent += "<".concat(h, " id=\"").concat(id, "\" class=\"h\">").concat(value_, "<a href=\"#\" class=\"arrow-up\">\u2191</a></").concat(h, ">\n");
              TOClist[value_] = {
                id: id,
                h: h.toUpperCase()
              };
            } else {
              htmlContent += "<".concat(h, " class=\"h\">").concat(value.replace(hres[0], ""), "</").concat(h, ">\n");
            }

            if (h == "h1") htmlContent += '<hr>\n';
            continue;
          } // Checks if first. Add Value


          if (htmlContent === '') {
            htmlContent += value + "\n";
          } else {
            htmlContent += value + "<br>\n";
          }
        } // Creates Table of Content after rendering everything

      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
            _iterator5["return"]();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      var toc = "<p class=\"font--small\"><b>Table of Contents</b></p>";

      for (var head in TOClist) {
        toc += "\n<a href=\"#".concat(TOClist[head].id, "\" class=\"toc-").concat(TOClist[head].h, " btn-primary btn--color-tertiary\">").concat(head, "</a><br>");
      } // Adds toc to processed content


      htmlContent = htmlContent.replace("[[toc]]", "<div class=\"toc\">".concat(toc, "</div>"));
      this.renderTOC = false; // Returns processed file.

      return htmlContent;
    }
    /**
     * Render Link.
     *
     * Renders links containing [[ {word} ]] and turns it 
     * into an <a>{word}</a> href tag.
     *
     * @access     public
     * @param {string}   value   word to check if it has a link format.
     * @return {string}  `<a>${word}</a>`
     */

  }, {
    key: "renderLink",
    value: function renderLink(value) {
      // Validator
      var links = value.match(/\[\[(.*?)\]\]/g);
      if (!links) return value; // Loop through found links.

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = links[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var link = _step6.value;
          if (link === '[[toc]]') continue; // Checks if link has a custom name through | division.

          var linkName = '';
          var linkDisplayName = '';

          if (link.includes('|')) {
            var rawSplit = link.split("|");
            linkName = rawSplit[0].trim().replace(/(\[|\])/g, '').toLowerCase();
            linkDisplayName = rawSplit[1].trim().replace(/(\[|\])/g, '');
          } else {
            linkName = link.trim().replace(/(\[|\])/g, '');
          } // Search Directly


          var linkNameLowered = linkName.toLowerCase().replace(/\s/g, '-');

          if (this.dir.hasOwnProperty(linkNameLowered)) {
            var dirItem = this.dir[linkNameLowered];
            var _name = dirItem.title;

            if (linkDisplayName !== '') {
              _name = linkDisplayName;
            }

            value = value.replace(link, "<a class=\"btn btn-secondary btn--link\" onclick=\"root.gotoPage('".concat(linkNameLowered, "')\">").concat(_name, "</a>"));
            continue;
          }

          var loweredlinkname = linkName.toLowerCase(); // Search Indirectly

          for (var _pageName in this.dir) {
            var _dirItem = this.dir[_pageName];

            if (_dirItem.title.toLowerCase() === loweredlinkname) {
              var _name2 = _dirItem.title;

              if (linkDisplayName !== '') {
                _name2 = linkDisplayName;
              }

              value = value.replace(link, "<a class=\"btn btn-secondary btn--link\" onclick=\"root.gotoPage('".concat(linkNameLowered, "')\">").concat(_name2, "</a>"));
              break;
            }
          } // Considers link as nonexistent and turns it red.


          var name = '';

          if (linkDisplayName !== '') {
            name = linkDisplayName;
          } else {
            name = link.replace(/\]/g, '').replace(/\[/g, '').trim();
          }

          value = value.replace(link, "<a class=\"btn btn-secondary btn--link red\" onclick=\"root.gotoPage('".concat(linkNameLowered, "')\">").concat(name, "</a>"));
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
            _iterator6["return"]();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return value;
    }
    /**
     * Render Bold Words.
     *
     * Renders words containing ** {word} ** and turns it into a
     * bold html tag.
     *
     * @access     public
     * @param {string}   value   word to check if it has a bold format.
     * @return {string}  `<b>${word}</b>`
     */

  }, {
    key: "renderWordBold",
    value: function renderWordBold(value) {
      var bold_words = value.match(/\*\*(.*?)\*\*/g);
      var bold_words2 = value.match(/\_\_(.*?)\_\_/g);

      if (bold_words) {
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = bold_words[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var word = _step7.value;
            value = value.replace(word, "<b>".concat(word.replace(/\*/g, "").trim(), "</b>"));
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
              _iterator7["return"]();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }
      }

      if (bold_words2) {
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = bold_words2[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var _word = _step8.value;
            value = value.replace(_word, "<b>".concat(_word.replace(/\_/g, "").trim(), "</b>"));
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
              _iterator8["return"]();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }
      }

      return value;
    }
    /**
     * Render Italic Words.
     *
     * Renders words containing * {word} * and turns it into an
     * italicized html tag.
     *
     * @access     public
     * @param {string}   value   word to check if it has a bold format.
     * @return {string}  `<b>${word}</b>`
     */

  }, {
    key: "renderWordItalic",
    value: function renderWordItalic(value) {
      var italic_words = value.match(/\*(.*?)\*/g);

      if (italic_words) {
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = italic_words[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var word = _step9.value;
            if (word == "**") continue;
            value = value.replace(word, "<i>".concat(word.replace(/\*/g, "").trim(), "</i>"));
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
              _iterator9["return"]();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }

      var italic_words2 = value.match(/\_(.*?)\_/g);

      if (italic_words2) {
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = italic_words2[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var _word2 = _step10.value;
            if (_word2 == "**") continue;
            value = value.replace(_word2, "<i>".concat(_word2.replace(/\_/g, "").trim(), "</i>"));
          }
        } catch (err) {
          _didIteratorError10 = true;
          _iteratorError10 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
              _iterator10["return"]();
            }
          } finally {
            if (_didIteratorError10) {
              throw _iteratorError10;
            }
          }
        }
      }

      return value;
    }
  }]);

  return TextRenderer;
}();
/**
 * Generate Random String ID.
 *
 * Creates a randomly generated id string. it checks \[idList\] var
 * if the string already exists, if so, it regenerates it.
 *
 * @access     public
 * @param {int}   length   length of random id string
 * @return {string}  randomly generated id string
 */


function makeid(length) {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  while (true) {
    var result = '';

    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    if (idList.includes(result)) continue;
    idList.push(result);
    return result;
  }
}