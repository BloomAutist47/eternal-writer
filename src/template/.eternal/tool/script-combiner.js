/*jshint esversion: 9 */

const fs = require('fs');
const path = require('path');

const lintHead = "/*jshint esversion: 9 */";
const pathFolder = path.join(__dirname, '..', 'js', 'components\\');
const pathSave = path.join(__dirname, '..', 'js', 'component.js');

var script = `${lintHead}\n\n`;

fs.readdirSync(pathFolder).forEach(file => {
  if (file.includes(".js")) {
    const js = fs.readFileSync(pathFolder + file, 'utf8');
    script += js.replace(lintHead, "").trim() + "\n\n";
  }
});

fs.readdirSync(pathFolder + 'editor/').forEach(file => {
    if (file.includes(".js")) {
      const js = fs.readFileSync(pathFolder + 'editor/' + file, 'utf8');
      script += js.replace(lintHead, "").trim() + "\n\n";
    }
  });


fs.writeFileSync(pathSave, script, {encoding: 'utf-8'});  

console.log("Done");