/*jshint esversion: 9 */

const fs = require('fs-extra');

const pathFolder = 'src/template/.eternal/js/components/';
const pathSave = 'src/template/.eternal/js/component.js';

var script = '/*jshint esversion: 9 */\n\n';

fs.readdirSync(pathFolder).forEach(file => {
  if (file.includes(".js")) {
    const js = fs.readFileSync(pathFolder + file, 'utf8');
    script += js.replace("/*jshint esversion: 9 */", "").trim() + "\n\n";
  }
});

fs.readdirSync(pathFolder + 'editor/').forEach(file => {
    if (file.includes(".js")) {
      const js = fs.readFileSync(pathFolder + 'editor/' + file, 'utf8');
      script += js.replace("/*jshint esversion: 9 */", "").trim() + "\n\n";
    }
  });


fs.writeFileSync(pathSave, script, {encoding: 'utf-8'});  

console.log("Done");