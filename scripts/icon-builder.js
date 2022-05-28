/*jshint esversion: 8 */

const fs = require('fs');
const pngToIco = require('png-to-ico');

pngToIco('assets/logo-3.png')
  .then(buf => {
    fs.writeFileSync('src/app.ico', buf);
  })
  .catch(console.error);