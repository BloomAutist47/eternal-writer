function getAsset(filename) {
  let raw = filename.split(".")
  const filetype = raw[raw.length - 1]

  switch (filetype) {
    case 'html':
      return fetch(`.eternal/assets/${filename}`)
        .then(response => response.text())
        .then(data => {
          return data
        })
      break;
    case 'json':
      return fetch(`.eternal/${filename}`)
        .then(response => response.json())
        .then(data => {
          return data
        })
      break;
    default:
      break
  }
}

function getPage(filename) {
  return fetch(filename)
    .then(async response => {
      const resp = await response.text()
      const validation = resp.toLowerCase()
      if (validation.includes("cannot get") || validation.includes("file not found")) {
        return `Page does not exists. Create <a href=""> ${filename}</a>?`
      }
      return resp
    })
}

function loadPage() {
  // Load Page
  if (window.location.search == "") return
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('p').trim()

  for (const page_link in directory) {
    if (page_link == page) {
      return getPage(directory[page]["url"])
        .then(data => {
          idList = []
          const dummy = document.createElement("div")
          dummy.innerHTML = data

          var scripts = dummy.querySelectorAll("script");
          for (let script of scripts) {
            if (script.innerText) {
              eval(script.innerText);
            } else if (script.src) {
              fetch(script.src).then(data => {
                data.text().then(r => { eval(r); })
              });
            }
            // To not repeat the element
            script.parentNode.removeChild(script);
          }

          const filedata = data.split('<!-- File Content -->')[1].trim()
          const processedFiledata = renderText(filedata)

          document.getElementById('page-content').innerHTML = processedFiledata
          document.getElementById('page-title').innerHTML = `<h1>${directory[page]["name"]}</h1>`


        })
    }
  }
  document.getElementById('page-content').innerHTML = `Page does not exists. Create <a href=""> ${page}</a>?`
}

function renderText(filedata) {
  const lines = filedata.split("\n")
  let htmlContent = ''

  for (const line of lines) {
    let value = line.trim()

    // Formats
    value = renderWordBold(value)
    value = renderWordItalic(value)

    // List
    if (value.startsWith("* ")) {
      htmlContent += `<li>${value.replace("* ", "").trim()}</li>\n`
      continue
    }

    // Headers
    const hres = value.match(/(#+)\s/);
    if (hres) {
      let h = getHeadValue(hres[0])
      htmlContent += `<div class="mt-4">\n</div><${h} class="h">${value.replace(hres[0], "")}</${h}>\n`
      if (h == "h1") htmlContent += '<hr>\n';
      continue
    }

    htmlContent += value + '<p class="space"></p>\n';
  }
  return htmlContent
}

function renderWordBold(value) {
  const bold_words = value.match(/\*\*(.*?)\*\*/g)
  if (bold_words) {
    for (const word of bold_words) {
      value = value.replace(word, `<b>${word.replace(/\*/g, "").trim()}</b>`)
    }
  }
  return value
}

function renderWordItalic(value) {
  const italic_words = value.match(/\*(.*?)\*/g)
  if (italic_words) {
    for (const word of italic_words) {
      if (word == "**") continue
      value = value.replace(word, `<i>${word.replace(/\*/g, "").trim()}</i>`)
    }
  }
  return value
}

function openSpoilers() {
  if (localStorage["theSongOfEnderion_isSpoiler"]) {
      const spoiler_div = document.getElementById("spoiler")
      const non_spoiler_div = document.getElementById("non-spoiler")
  
      spoiler_div.style.display = "block"
      non_spoiler_div.style.display = "none"
      localStorage["theSongOfEnderion_isSpoiler"] = true;
  }

}

function toggleSpoilers() {
  const spoiler_div = document.getElementById("spoiler")
  const non_spoiler_div = document.getElementById("non-spoiler")

  if (spoiler_div.style.display == "none") {
      spoiler_div.style.display = "block"
      non_spoiler_div.style.display = "none"
      localStorage["theSongOfEnderion_isSpoiler"] = true;
  } else {
      spoiler_div.style.display = "none"
      non_spoiler_div.style.display = "block"
      localStorage["theSongOfEnderion_isSpoiler"] = false;
  }

  console.log(localStorage["theSongOfEnderion_isSpoiler"])
}


function createSpoiler() {
  const spoilerDiv = document.getElementById("spoiler-button")
  spoilerDiv.classList.add("float-end", "tooltipStyle")
  spoilerDiv.innerHTML = `
    <label class="switch">
      <input type="checkbox" onclick="toggleSpoilers()">
      <span class="slider round"></span>
    </label>
    <span class="tooltipStyletext">Enables Spoilers!</span>`

    if (localStorage["theSongOfEnderion_isSpoiler"] == 'true') {
      spoilerDiv.getElementsByTagName('input')[0].checked = true;
      // openSpoilers()
      document.getElementById("non-spoiler").style.display = "none"
      document.getElementById("spoiler").style.display = "block"
  } else {
      document.getElementById("non-spoiler").style.display = "block"
      document.getElementById("spoiler").style.display = "none"
  }


}



// TABLE OF CONTENT
function createTOC(content_div, toc_element) {

  const toc = document.getElementById(toc_element);
  const headers = document.getElementById(content_div).getElementsByClassName("h");

  if (toc == null) {
    alert(`Table of Content Error: \nthe div with "${toc_element}" id is missing`);
    return;
  }

  toc.classList.add("toc");

  // Adds Title
  toc.insertAdjacentHTML('beforeend', `<p><b>Table of Contents</b></p>`);

  for (const head of headers) {

    // Add ID
    head.id = head.textContent.replace(" ", "_").toLocaleLowerCase();

    // Create links
    toc.insertAdjacentHTML('beforeend', `
        <a href="#${head.id}" class="toc-${head.tagName}">${head.innerText}</a>`);

    // Add Arrow Up
    head.insertAdjacentHTML('beforeend', `<a href="#" class="arrow-up">↑</a>`);

    // Add links to toc
    toc.appendChild(document.createElement('br'));
  }
}


// PROFILE BOX
function createProfileBox(profile_id) {
  const profle_obj = profile_data[profile_id]
  const div = document.getElementById(profile_id)

  // Validation
  if (div == null) {
    alert(`Profile Box Error: The div with "${profile_id}" id is missing`)
    return
  }
  div.classList.add("float-end", "profile-box")

  // Create Title
  div.insertAdjacentHTML('beforeend', `<span class="profile-title bold">${profle_obj['Title']}</span>`)

  // Create Image Tabs
  if (profle_obj.hasOwnProperty('Image')) {

    // Create ids
    let btn_group_id = profile_id + "-" + makeid(8)
    let btn_content_id = makeid(8)

    let image_ids = {}

    // Create Button Group
    let btn_group = document.createElement('div')
    btn_group.id = btn_group_id

    div.appendChild(btn_group)

    // Create Buttons and Images
    let first = true
    for (const image in profle_obj['Image']) {

      // Create Buttons
      image_ids[image] = image.replace(" ", "_").toLocaleLowerCase() + "-" + makeid(8)

      let btn_tab = document.createElement("button")
      btn_tab.classList.add("btn", "profile-image-btn")
      btn_tab.innerText = image
      btn_tab.setAttribute("onclick", `openTab(this, '${image_ids[image]}', '${btn_content_id}', '${btn_group_id}')`)

      btn_group.appendChild(btn_tab)


      // Add active status if first one
      let display_style = "none"
      if (first) {
        btn_tab.classList.add("profile-tab-active")
        display_style = "block"
        first = false;
      }

      // Create Image Div
      div.insertAdjacentHTML('beforeend', `
            <div id="${image_ids[image]}" class="green-box profile-image ${btn_content_id}" style="display: ${display_style};">
              <img src="${profle_obj['Image'][image]}" class="img-fluid mx-auto d-block" alt="...">
            </div>`)
    }


  }

  // Create Table
  const table = document.createElement("table")
  table.id = "profile-table"
  table.classList.add("table")

  const tbody = document.createElement("tbody")

  for (const category in profle_obj['Content']) {

    // Category Name
    if (category != "Desc") {
      tbody.insertAdjacentHTML('beforeend', `<tr><td class="bold profile-category" colspan="2">${category}</td></tr>`)
    }

    // Category Row-Cell values
    for (const type in profle_obj['Content'][category]) {
      if (category == "Image") continue
      const tr = document.createElement("tr")

      // Type Name
      let type_name_td = document.createElement("td")
      type_name_td.classList.add("bold", "profile-cell")
      type_name_td.style = "width: 35%;"
      type_name_td.innerText = type

      // Type Value
      let type_value_td = document.createElement("td")
      type_value_td.classList.add("profile-cell")

      if (Array.isArray(profle_obj['Content'][category][type])) {
        for (const item of profle_obj['Content'][category][type]) {
          let item_content = item
          if (item.includes("|")) {
            let raw_list = item.split("|")
            item_content = `<a href=${raw_list[1]}>${raw_list[0]}</a>`
          }
          type_value_td.innerHTML += `• ${item_content} <br>`
        }
      } else {
        let item_content = profle_obj['Content'][category][type]
        if (profle_obj['Content'][category][type].includes("|")) {
          let raw_list = item.split("|")
          item_content = `<a href=${raw_list[1]}>${raw_list[0]}</a>`
        }
        type_value_td.innerText = item_content
      }

      // Add to Table
      tr.appendChild(type_name_td)
      tr.appendChild(type_value_td)
      tbody.append(tr)
    }

  }
  // Add to Page
  table.appendChild(tbody)
  div.appendChild(table)
}


// CREATE PAGE TABS
function createPageTabs(button_id_div, tab_id_array) {

  const content_group_class = makeid(7)
  const btn_group_id = makeid(7)

  const div = document.getElementById(button_id_div)
  const btn_div = document.createElement("div")
  btn_div.id = btn_group_id

  let first = true
  for (const id of tab_id_array) {
    const elem = document.getElementById(id)
    elem.classList.add(content_group_class)
    elem.style.display = "none"

    const btn = document.createElement("button")
    btn.innerText = id
    btn.setAttribute("onclick", `openTab(this, '${id}', '${content_group_class}', '${btn_group_id}')`)
    btn.classList.add("btn", "profile-image-btn")

    if (first == true) {
      btn.classList.add("profile-tab-active")
      elem.style.display = "block"
      first = false
    }

    btn_div.appendChild(btn)
  }
  div.appendChild(btn_div)
}

function getHeadValue(sharp) {
  switch (sharp) {
    case "# ":
      return 'h1';
    case "## ":
      return 'h2';
    case "### ":
      return 'h3';
    case "#### ":
      return 'h4';
    case "##### ":
      return 'h5';
    case "###### ":
      return 'h6';
    default:
      return 'null'
      break;
  }
}

function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
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
    if (!gbtn.classList.contains("profile-tab-active")) continue
    gbtn.classList.remove("profile-tab-active")
  }

  // Adds Active Class on Current Tab
  let tab_content = document.getElementById(tabName)
  tab_content.style.display = "block"

  btn.classList.add("profile-tab-active")
}



function makeid(length) {
  while (true) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    if (idList.includes(result)) continue
    idList.push(result)
    return result;
  }
}