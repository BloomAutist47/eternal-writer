// Global Variables
var directory; // Obj containing directory.json
var idList = []; // List of randomly generated ids
var pageCard; // Contains the page card Class
var editorData; // Contains parsed data for the editor

// Functions
function getAsset(filename) {
  let raw = filename.split(".");
  const filetype = raw[raw.length - 1];

  switch (filetype) {
    case 'html':
      return fetch(`.eternal/assets/${filename}`)
        .then(response => response.text())
        .then(data => {
          return data;
        })
      break;
    case 'json':
      return fetch(`.eternal/${filename}`)
        .then(response => response.json())
        .then(data => {
          return data;
        })
      break;
    default:
      break;
  }
}

/**
 * Get HTML Page.
 *
 * Fetches the html file with its fileURL.
 *
 * @access     public
 * @param {string}   fileUrl   url of the html page
 * @return {string}  the html file string. null if not found
 */
function getPage(fileUrl) {
  return fetch(fileUrl)
    .then(async response => {
      const resp = await response.text();
      const validation = resp.toLowerCase();
      if (validation.includes("cannot get") || validation.includes("file not found")) {
        return null;
      }
      return resp;
    })
}

/**
 * Parse HTML String.
 *
 * Parses an HTML string into a Node object.
 *
 * @access     public
 * @param {string}   html   html string
 * @return {Node}  a node with the parsed html string
 */
function parseHTML(html) {
  let t = document.createElement('template');
  t.innerHTML = html;
  return t.content.cloneNode(true);
}

/**
 * Checks if Object is Empty or not.
 *
 * Uses typeof and key check to validate whether the object
 * is null or has no keys.
 *
 * @access     public
 * @param {Object}   object   object var to check
 * @return {boolean}  true if object is empty. false if not empty
 */
function isObjEmpty(object) {
  if (typeof object !== 'undefined' && Object.keys(object).length != 0) {
    return false;
  }
  return true;
}


function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}


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
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  while (true) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if (idList.includes(result)) continue
    idList.push(result)
    return result;
  }
}

function openTab(btn, tabName, content_group_class, btn_group_id) {
  var tabs = document.getElementsByClassName(content_group_class);

  // Removes Active Class on other Tabs
  for (const tab of tabs) {
    tab.style.display = "none"
  }

  let btngroup = document.getElementById(btn_group_id).getElementsByTagName('button')
  for (const gbtn of btngroup) {
    if (gbtn == btn) continue
    if (!gbtn.classList.contains("tab-active")) continue
    gbtn.classList.remove("tab-active")
  }

  // Adds Active Class on Current Tab
  let tab_content = document.getElementById(tabName)
  tab_content.style.display = "block"

  btn.classList.add("tab-active")
}

function openModal(modalID) {
  let modal = document.getElementById(modalID)
  modal.classList.toggle('modal-visible')
    // Hide scrollbar
  document.getElementsByTagName("body")[0].classList.toggle("disable-srolling")
  document.getElementsByTagName("html")[0].classList.toggle("disable-srolling")

  // Exits modal if clicked outsie
  if (modal.onclick != null) return;
  modal.onclick = (event) => {
    if (event.target == modal) {
      modal.classList.remove('modal-visible')
        // Reveal Scrollbar
      document.getElementsByTagName("body")[0].classList.remove("disable-srolling")
      document.getElementsByTagName("html")[0].classList.remove("disable-srolling")
    }
  }

}

function createTabs(button_id_div, tabIdsObj) {

  const content_group_class = makeid(7)
  const btn_group_id = makeid(7)

  const div = document.getElementById(button_id_div)
  const btn_div = document.createElement("div")
  btn_div.id = btn_group_id

  let first = true
  for (const idObj of tabIdsObj) {
    const elem = document.getElementById(idObj.id)
    elem.classList.add(content_group_class)
    elem.style.display = "none"

    const btn = document.createElement("button")
    btn.innerText = idObj.name
    btn.setAttribute("onclick", `openTab(this, '${idObj.id}', '${content_group_class}', '${btn_group_id}')`)
    btn.classList.add("btn", "profile-image-btn")

    if (first == true) {
      btn.classList.add("tab-active")
      elem.style.display = "block"
      first = false
    }

    btn_div.appendChild(btn)
  }
  div.appendChild(btn_div)
}

function toggleSpoilers() {
  const spoiler_div = document.getElementById("spoiler")
  const non_spoiler_div = document.getElementById("non-spoiler")

  if (spoiler_div.style.display == "none") {
    spoiler_div.style.display = "block"
    non_spoiler_div.style.display = "none"
    localStorage["theSongOfEnderion_isSpoiler"] = true;
    document.getElementById('spoilerTooltipTexts').innerText = "Hide Spoilers";
  } else {
    spoiler_div.style.display = "none"
    non_spoiler_div.style.display = "block"
    localStorage["theSongOfEnderion_isSpoiler"] = false;
    document.getElementById('spoilerTooltipTexts').innerText = "Show Spoilers";
  }
}



class TextRenderer {
  constructor() {
    this.headerConvertionTable = {
      '# ': 'h1',
      '## ': 'h2',
      '### ': 'h3',
      '#### ': 'h4',
      '##### ': 'h5',
      '###### ': 'h6',
    };
  }

  renderText(filedata) {
    const lines = filedata.split("\n");
    let htmlContent = '';

    for (const line of lines) {
      let value = line.trim();

      // Formats
      value = this.renderWordBold(value);
      value = this.renderWordItalic(value);

      // List
      if (value.startsWith("* ")) {
        htmlContent += `<li>${value.replace("* ", "").trim()}</li>\n`;
        continue;
      }

      // Headers
      const hres = value.match(/(#+)\s/);
      if (hres) {
        let h = this.headerConvertionTable[hres[0]];
        htmlContent += `<div class="mt-4">\n</div><${h} class="h">${value.replace(hres[0], "")}</${h}>\n`;
        if (h == "h1") htmlContent += '<hr>\n';
        continue;
      }

      htmlContent += value + '<p class="space"></p>\n';
    }
    return htmlContent;
  }

  renderWordBold(value) {
    const bold_words = value.match(/\*\*(.*?)\*\*/g);
    if (bold_words) {
      for (const word of bold_words) {
        value = value.replace(word, `<b>${word.replace(/\*/g, "").trim()}</b>`);
      }
    }
    return value;
  }

  renderWordItalic(value) {
    const italic_words = value.match(/\*(.*?)\*/g);
    if (italic_words) {
      for (const word of italic_words) {
        if (word == "**") continue;
        value = value.replace(word, `<i>${word.replace(/\*/g, "").trim()}</i>`);
      }
    }
    return value;
  }

}

// Class
class Card {


  constructor() {
    this.pageData = {}
    this.profileData = {}
  }
  async renderFromHTML(inputUrl) {
    let htmlData = await this.findFileData(inputUrl);
    if (!htmlData) return;
    await this.renderPage(htmlData)
  }

  async renderPage(htmlData) {

    // Loads the Page and Renders Data
    await this.loadPage(htmlData);

    this.pageData = pageData;
    this.profileData = profileData;

    // Create Table of Content
    this.createTOC();

    // Create Profile Box
    this.createProfileBox();

    // Create Spoiler Tab Division
    this.createSpoiler();

    // Create Page Tabs
    this.createPageTabs();
  }

  /**
   * Load HTML Page.
   *
   * This takes a plain text HTML file and parses it 
   * into the div#page-content.
   *
   * @access     public
   * @see  TextRenderer 
   * @param {string}   htmlData   A string of the html file.
   */
  async loadPage(htmlData) {
    // Variables

    idList = []

    // Parses the data into a node
    const splitData = htmlData.split('<!-- File Content -->');

    // Loads the Scripts
    this.loadScripts(splitData[0]);

    // Loads File Content
    const contentData = splitData[1].trim();
    const rt = new TextRenderer();

    // Save data for editor
    this.saveEditorData(contentData);

    // Set Page data
    let pageContent = document.getElementById('page-content');
    pageContent.innerHTML = rt.renderText(contentData);
    document.getElementById('page-title').innerHTML = `<h1>${pageData.title}</h1>`;
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
  loadScripts(scriptData) {
    let parsedData = parseHTML(scriptData);

    let scripts = parsedData.querySelectorAll("script");
    for (let script of scripts) {
      if (script.innerText) {
        eval(script.innerText);
      } else if (script.src) {
        fetch(script.src).then(data => {
          data.text().then(r => {
            eval(r);
          })
        });
      }
      // To not repeat the element
      script.parentNode.removeChild(script);
    }
  }

  /**
   * Find the location of the url html.
   *
   * Gets the urlstring from the ?p=url-string and searches the
   * directory obj if the url exist. If so, opens the actual url
   * path and loads the html into a string value and returns it.
   *
   * @access     private
   * @param {string}   inputUrl  e.g. ethan-morales
   * @return {string}  A string of the html file.
   */
  async findFileData(inputUrl) {
    // Finds Page data
    for (const pageUrl in directory) {
      if (pageUrl == inputUrl) {
        let result = await getPage(directory[inputUrl]["url"])
        return result;
      }
    }
    document.getElementById('page-content').innerHTML = `Page does not exists. Create <a href=""> ${inputUrl}</a>?`;
    return false;
  }

  /**
   * Saves Editor Data.
   *
   * Gets the file content str without the file data script
   * and replaces the \n\n with a <p> tag to preserve new lines
   * then splits it to individual line to remove any spaces.
   * It then saves it to global variable "editorData".
   *
   * @access     private
   * @param {string}   contentData  athe file content
   */
  saveEditorData(contentData) {
    let editorLineData = "";
    for (let line of contentData.replace("\n\n", '<p></p>').split("\n")) {
      editorLineData += line.trim() + "\n";
    }

    editorData = parseHTML(editorLineData);
  }

  /**
   * Create Table of Contents.
   *
   * Replaces the [[toc]] with a table of content linking
   * to all the headers.
   *
   * @access     private
   */
  createTOC() {
    const divs = document.getElementsByClassName("page-tab");
    for (const contdiv of divs) {

      let divText = contdiv.innerHTML.trim();

      if (divText == '') continue;
      if (!divText.includes("[[toc]]")) continue;

      let headers = contdiv.getElementsByClassName("h");
      let toc = `<div class="toc"><p><b>Table of Contents</b></p>`;
      let alreadyDone = false;
      for (const head of headers) {

        // Add ID
        if (head.id != '') {
          alreadyDone = true;
          break;
        }

        head.id = head.textContent.replace(" ", "_").toLocaleLowerCase() + "-" + makeid(8);

        // Create links
        toc += `<a href="#${head.id}" class="toc-${head.tagName}">${head.innerText}</a><br>\n`;

        // Add Arrow Up
        head.insertAdjacentHTML('beforeend', `<a href="#" class="arrow-up">↑</a>`);
      }

      if (alreadyDone) continue;
      contdiv.innerHTML = contdiv.innerHTML.replace("[[toc]]", toc + '</div>\n');
    }
  }

  /**
   * Create Profile Box.
   *
   * Parses the [profileData] variable and inserts a div on the
   * very top of parent divs where the profile box is created.
   *
   * @access     private
   */
  createProfileBox() {
    // Validation Check
    if (!pageData.functions.hasOwnProperty('createProfileBox') && pageData.functions.createProfileBox != true) return;
    if (isObjEmpty(profileData)) return;

    for (const pageTabId in profileData) {
      const profle_obj = profileData[pageTabId];
      const div = document.createElement('div');
      div.id = pageTabId + "-profilebox";

      // Validation
      if (div == null) {
        alert(`Profile Box Error: The div with "${profile_id}" id is missing`);
        return;
      }
      div.classList.add("float-end", "profile-box");

      // Create Title
      div.insertAdjacentHTML('beforeend', `<span class="profile-title bold">${profle_obj['Title']}</span>`);

      // Create Image Tabs
      if (profle_obj.hasOwnProperty('Image')) {

        // Create ids
        let btn_group_id = div.id + "-" + makeid(8);
        let btn_content_id = makeid(8);

        let image_ids = {};

        // Create Button Group
        let btn_group = document.createElement('div');
        btn_group.id = btn_group_id;

        div.appendChild(btn_group);

        // Create Buttons and Images
        let first = true;
        for (const image in profle_obj['Image']) {

          // Create Buttons
          image_ids[image] = image.replace(" ", "_").toLocaleLowerCase() + "-" + makeid(8);

          let btn_tab = document.createElement("button");
          btn_tab.classList.add("btn", "profile-image-btn");
          btn_tab.innerText = image;
          btn_tab.setAttribute("onclick", `openTab(this, '${image_ids[image]}', '${btn_content_id}', '${btn_group_id}')`);

          btn_group.appendChild(btn_tab);


          // Add active status if first one
          let display_style = "none";
          if (first) {
            btn_tab.classList.add("tab-active");
            display_style = "block";
            first = false;
          }

          // Create Image Div
          div.insertAdjacentHTML('beforeend', `
                <div id="${image_ids[image]}" class="green-box profile-image ${btn_content_id}" style="display: ${display_style};">
                  <img src="${profle_obj['Image'][image]}" class="img-fluid mx-auto d-block" alt="...">
                </div>`);
        }

      }

      // Create Table
      const table = document.createElement("table");
      table.id = "profile-table";
      table.classList.add("table");

      const tbody = document.createElement("tbody");

      for (const category in profle_obj['Content']) {

        // Category Name
        if (category != "Desc") {
          tbody.insertAdjacentHTML('beforeend', `<tr><td class="bold profile-category" colspan="2">${category}</td></tr>`)
        }

        // Category Row-Cell values
        for (const type in profle_obj['Content'][category]) {
          if (category == "Image") continue;
          const tr = document.createElement("tr");

          // Type Name
          let type_name_td = document.createElement("td");
          type_name_td.classList.add("bold", "profile-cell");
          type_name_td.style = "width: 35%;";
          type_name_td.innerText = type;

          // Type Value
          let type_value_td = document.createElement("td");
          type_value_td.classList.add("profile-cell");

          if (Array.isArray(profle_obj['Content'][category][type])) {
            for (const item of profle_obj['Content'][category][type]) {
              let item_content = item;
              if (item.includes("|")) {
                let raw_list = item.split("|");
                item_content = `<a href=${raw_list[1]}>${raw_list[0]}</a>`;
              }
              type_value_td.innerHTML += `• ${item_content} <br>`;
            }
          } else {
            let item_content = profle_obj['Content'][category][type];
            if (profle_obj['Content'][category][type].includes("|")) {
              let raw_list = item.split("|");
              item_content = `<a href=${raw_list[1]}>${raw_list[0]}</a>`;
            }
            type_value_td.innerText = item_content;
          }

          // Add to Table
          tr.appendChild(type_name_td);
          tr.appendChild(type_value_td);
          tbody.append(tr);
        }

      }
      // Add to Page
      table.appendChild(tbody);
      div.appendChild(table);


      let parentDiv = document.createElement("div")
      parentDiv.classList.add("profile-box-parent")
      parentDiv.appendChild(div)

      document.getElementById(pageTabId).prepend(parentDiv);
    }
  }

  /**
   * Create Spoiler Divs.
   *
   * Takes the 'spoiler' and 'non-spoiler' div in the html file
   * and places them in two tabs. It also creates a spoiler
   * switch button.
   *
   * @access     private
   */
  createSpoiler() {

    if (!pageData.functions.hasOwnProperty('createSpoilers') && pageData.functions.createSpoilers != true) {
      // Hides spoiler div if createSpoilers is not enabled
      let spoilerDiv = document.getElementById('spoiler');
      if (spoilerDiv) spoilerDiv.style.display = "none";
      return;
    }

    const spoilerDiv = document.getElementById("spoiler-button");
    spoilerDiv.classList.add("float-end", "tooltipStyle");
    spoilerDiv.innerHTML = `
    
      <label class="switch" >
        <input type="checkbox" onclick="toggleSpoilers()" >
        <span class="slider round"></span>
      </label>
      <span class="tooltipStyletext" id="spoilerTooltipTexts">Show Spoilers</span>`;

    if (localStorage["theSongOfEnderion_isSpoiler"] == 'true') {
      spoilerDiv.getElementsByTagName('input')[0].checked = true;
      // openSpoilers()
      document.getElementById("non-spoiler").style.display = "none";
      document.getElementById("spoiler").style.display = "block";
      document.getElementById('spoilerTooltipTexts').innerText = "Hide Spoilers";
    } else {
      document.getElementById("non-spoiler").style.display = "block";
      document.getElementById("spoiler").style.display = "none";
    }
  }

  /**
   * Create Page Tabs.
   *
   * Using the pageData.fileStructure, turns divs with 'page-tab'
   * class into separate tabs.
   *
   * @access     private
   */
  createPageTabs() {
    if (pageData.functions.createTabs && Object.keys(pageData.functions.createTabs).length != 0) {
      for (const obj of pageData.functions.createTabs) {
        let div = document.getElementById(obj.contentArea)

        let btn = document.createElement('div')
        btn.id = obj.contentArea + "-page-tab-button-" + makeid(5)

        div.prepend(btn)

        createTabs(btn.id, obj.tabs)
      }
    }
  }
  getPageData() {
    return this.pageData;
  }

  getProfileData() {
    return this.profileData;
  }

}

class PageEditor {
  constructor(card) {
    this.card = card
    this.loadEditor()
  }

  loadEditor() {
    getAsset('editor.html')
      .then(data => {
        document.getElementById('page-editor').innerHTML = data;
        document.getElementById('page-editor').insertAdjacentHTML('beforeend', `<button id="modalbtn" onclick="openModal('editor-modal')">open modal</button>`);

        // Create Spoiler and Non-Spoiler Tabs
        this.createTabs();

        this.createEditorContent();

      })
  }

  createTabs() {
    createTabs('editor-content-spoiler-tab-btns', [{
      name: 'NON-SPOILER CONTENT',
      id: 'editor-nonspoiler'
    }, {
      name: 'SPOILER CONTENT',
      id: 'editor-spoiler'
    }]);
    this.showSpoilers();
  }

  showSpoilers() {
    const btns = document.getElementById('editor-content-spoiler-tab-btns')
    if (btns.style.display == "none") {
      btns.style.display = "block";
      document.getElementById('editor-nonspoiler').style.display = "block";
      document.getElementById('editor-spoiler').style.display = "none";
    } else {
      btns.style.display = "none";
      btns.getElementsByTagName('Button')[0].click()
      document.getElementById('editor-spoiler').style.display = "none";
    }
  }

  createEditorContent() {
    let pageData = this.card.pageData;

    // Create Spoiler Switch
    if (pageData.functions.hasOwnProperty('createSpoilers') && pageData.functions.createSpoilers == true) {
      document.getElementById('editorSpoilerCheck').checked = true
      this.showSpoilers()
    }

    // Create Text Areas
    this.createTextArea('spoiler');
    this.createTextArea('nonspoiler');
  }

  createMDEditor(textarea, initialValue) {
    return new EasyMDE({
      element: textarea,
      initialValue: initialValue,
      autofocus: true,
      hideIcons: [
        "guide",
        "side-by-side",
        "preview"
      ],
      forceSync: true,
    });
  }

  createTextArea(area) {
    if (!pageData.fileStructure.hasOwnProperty(area)) return

    let contentArea = document.getElementById(`editor-${area}`);
    let tabs = [];

    for (const tab in pageData.fileStructure[area]) {

      // Create Div to put MD
      let textdiv = document.createElement('div');
      textdiv.id = area + "-" + makeid(5);

      // Create Textarea
      let textarea = document.createElement("textarea");

      // Append div
      textdiv.appendChild(textarea)
      contentArea.appendChild(textdiv)

      // Create Markdown
      this.createMDEditor(textarea,
        editorData.getElementById(tab).innerHTML.trim())

      // Add Tab to button
      tabs.push({
        name: pageData.fileStructure[area][tab],
        id: textdiv.id
      });
      
      // Set Markdown Initial Value
      // easyMDE.value();
    }

    createTabs(`editor-${area}-tab-btns`, tabs);
  }


}