#!/usr/bin/env node
let program    = require('commander');
let YAML       = require('yamljs');
let Handlebars = require('handlebars');
let fs         = require('fs');
let path       = require('path');

let replaceContent = require("./lib/replaceContent");
let readTextFile   = require("./lib/readTextFile");

// Helpers -------------
let helpers = [require('./helpers/joinUsing'), require('./helpers/nTimes')];

require('./helpers')
    .registerHelpers(helpers);


Handlebars.registerHelper('lowerFirst', str => str.length > 0 ? str[0].toLowerCase() + str.substr(1) : str);
Handlebars.registerHelper('upperFirst', str => str.length > 0 ? str[0].toUpperCase() + str.substr(1) : str);
Handlebars.registerHelper('json', v => new Handlebars.SafeString(JSON.stringify(v)));
Handlebars.registerHelper('length', v => Array.isArray(v) ? v.length : Object.keys(v).length);
Handlebars.registerHelper('at', (k, v) => v ? v[k] : "");

program
    .version('0.5.0')
    .usage('[options] <templates>')
    .option('-D --define <key=value>', "Define local variables", collectPairs, {})
    .option('-j --json <json>', "Define local variables as json", JSON.parse, {})
    .option('-g --genfile <json>', "Use the specific genfile")
    .option('-r --replace <key>',
            "Dont overwrite the output file, but replace anything " + "matching {{{<key>}}}. Default: yield", 'yield')
    .option("-o, --output <file>", "Set the output file", '')


program
    .command('map [INPUT_FILES...]')
    .description('Transform an input using script files')
    .option('--js <js_module>', 'Add a javascript module to the transform chain', list, [])
    .action((inputFiles, options) => {

        if (options.js.length === 0) {
            throw "At least one `--js SCRIPT_FILE` parameter is required";
        }

        let scripts     = options.js.map(script => code => require(script)(code, program));
        let mapFile     = inputFile =>
            readTextFile(inputFile)
                .then(input => scripts.reduce((memo, fn) => fn(memo), input))
                .then(replaceContent(inputFile));

        let transformed = Promise.all(inputFiles.map(mapFile));

        return wrapAction(transformed);
    });


program
    .command('template [TEMPLATE_FILES...]')
    .description("generate code using templates")
    .action((templateFiles) => {
        let single = (p) => {
            if (!p.output) throw new Error("--output required when a single file is processed");
            return replaceFile(p.output, Object.assign(p.json, p.define), p.args);
        }

        return (program.genfile) ? readGenFile(program.genfile) : single(program);

    });


program
    .parse(process.argv);


function wrapAction(promise) {
    promise
        .then(v => console.log("OK", v))
        .catch(err => {
            console.error([err.name, err.message, err.toString()]);
            if (err.stack) {
                console.error("\n", err.stack);
            }
        });
}

//////////////////////////////////////////////////////////////////////

function collectPairs(val, memo) {
    let [k, v] = val.split("=");
    if (v && v.length > 0 && k.length > 0) {
        memo[k] = v;
    }
    return memo;
}


function list(val, memo) {
    return memo.concat(val);
}

function flatten(arr) {
    return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
}

//////////////////////////////////////////////////////////////////////

//function main(program) {
//
//    let single = (p) => {
//        if (!p.output) throw new Error("--output required when a single file is processed");
//        return replaceFile(p.output, Object.assign(p.json, p.define), p.args);
//    }
//
//    return (program.genfile) ? readGenFile(program.genfile) : single(program);
//}

//////////////////////////////////////////////////////////////////////

function readGenFile(genfilePath) {
    // return new Promise((ok, fail) => {
    let reducer = (memo, f) => memo.concat(mapOutputs(f));
    let tc      = f => a => {
        try {
            return Promise.resolve(f(a));
        } catch (e) {
            return Promise.reject(e);
        }
    };

    let genSingleOutput = (inputs, output, data) => replaceFile(output, data, flatten(inputs));
    let mapOutputs      = o => Object.keys(o.outputs).map((k) => genSingleOutput(o.inputs, k, o.outputs[k]));

    return Promise.resolve(tc(f => YAML.load(f))(genfilePath))
                  .then(data => Promise.all(data.reduce(reducer, [])));
}

//////////////////////////////////////////////////////////////////////
//
//function replaceContent(fileName) {
//
//    return data => new Promise((resolve, reject) => {
//        if (fs.existsSync(fileName) && fs.readFileSync(fileName, "utf-8") === data) {
//            resolve(["same", fileName]);
//        }
//        fs.writeFile(fileName, data, "utf-8", (err) => {
//            return err ? reject(err) : resolve(["written", fileName]);
//        });
//
//    });
//}


//

//function readTextFile(f) {
//    return new Promise((resolve, reject) => {
//
//        fs.readFile(f, "utf-8", (err, res) => {
//            if (err) {
//                return reject(err);
//            }
//            resolve(res);
//        });
//    });
//}

function template(data) {
    return text => {
        let result = false;
        try {
            result = Handlebars.compile(text)(data);
        } catch (e) {
            return Promise.reject(e);
        }
        return Promise.resolve(result);
    };
}


function replaceFile(output, data, inFiles) {
    let files = inFiles.map(readTextFile);
    return Promise.all(files)
                  .then(bs => bs.join("\n\n"))
                  .then(template(data))
                  .then(replaceContent(output))
}
