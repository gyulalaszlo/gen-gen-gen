"use strict";

let fs = require('fs');

function replaceContent(fileName) {

    return data => new Promise((resolve, reject) => {
        if (fs.existsSync(fileName) && fs.readFileSync(fileName, "utf-8") === data) {
            resolve(["same", fileName]);
        }
        fs.writeFile(fileName, data, "utf-8", (err) => {
            return err ? reject(err) : resolve(["written", fileName]);
        });

    });
}


module.exports = replaceContent;