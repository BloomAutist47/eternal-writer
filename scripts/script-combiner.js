/*jshint esversion: 9 */


import fs from 'fs-extra';
import path from 'path';
import {minify} from 'minify';

// Location
const pathComponent = 'src/template/.eternal/js/components/';
const pathRender = 'src/template/.eternal/js/renders/';
const pathSave = 'src/template/.eternal/js/main.min.js';

// Var
var script = '/*jshint esversion: 9 */\n\n';

let files  = [];
function ThroughDirectory(Directory) {
  fs.readdirSync(Directory).forEach(File => {
      const Absolute = path.join(Directory, File);
      if (fs.statSync(Absolute).isDirectory()) return ThroughDirectory(Absolute);
      else return files.push(Absolute);
  });
}



// Combine Render
files  = [];
ThroughDirectory(pathRender);
for (const file of files) {
  const js = fs.readFileSync(file, 'utf8');
  script += js.replace("/*jshint esversion: 9 */", "").trim() + "\n\n";
}


// Combine Components
files  = [];
ThroughDirectory(pathComponent);
for (const file of files) {
  const js = fs.readFileSync(file, 'utf8');
  script += js.replace("/*jshint esversion: 9 */", "").trim() + "\n\n";
}


fs.writeFileSync(pathSave, script, {encoding: 'utf-8'});  

// Minify
async function minifyFile(pathSave) {
  const options = {
    html: {
        removeAttributeQuotes: false,
        removeOptionalTags: false,
    },
    js: {
      compress: true,
      mangle: true,
    }
  };

  const data = await minify(pathSave, 'name', options);
  fs.writeFileSync(pathSave, data, {encoding: 'utf-8'});  
  console.log("Done");
}

minifyFile(pathSave);


const pathSaveCSS = 'src/template/.eternal/css/style.css';
minifyFile(pathSaveCSS);