"use strict";

let fs = require('fs');

function readTextFile(f) {
    return new Promise((resolve, reject) => {
        fs.readFile(f, "utf-8", (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
}


module.exports = readTextFile;