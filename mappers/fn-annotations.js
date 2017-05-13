"use strict";


const errTo    = require('./fn-annotations/pretty-errors');
let typoParser = require('./fn-annotations/typo-peg');
let t          = require('tcomb');

// A symbol name
let SymName = t.refinement(
    t.String,
    s => s.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/) !== null,
    "SymName");


// a functions type
let FnTypo =
        t.struct({
                     implementer: SymName,
                     declareAs  : SymName,
                     domain     : t.list(t.String),
                     coDomain   : t.String,
                     isCurried  : t.Bool,
                     isExported : t.Bool,
                 }, "FnTypo");


// -----------------------------------------------------------------------------

const printParserError = msg =>
    errTo(msg, ["expected", "found", "file"], e => { throw(e);});


let fromString = t.func([t.String], FnTypo, "fromString")
                  .of(fromString_);

// :: fn_ as fn ::
function fromString_(s) {
    try {
        return FnTypo(typoParser.parse(s));
    } catch (e) {
        printParserError(s)(e);
    }
}


///


let toString = t.func([FnTypo], t.String, "toString")
                .of(toString_);


function toString_(fn) {
    return '' +
        'let ' + fn.declareAs + ' =\n' +
        '   t.func([\n' +
        '             ' + fn.domain.join(', ') + '\n' +
        '          ], ' + fn.coDomain + ',\n' +
        '          "' + fn.declareAs + '")\n' +
        '    .of(' + fn.implementer + ', true);\n\n' +
        'module.exports.' + fn.declareAs + ' = ' + fn.declareAs + ";";
}


// Converts a file

function addToCode(code, options = {}) {

    let signatures = code.split(/[\r\n]+/)
                         .map(l => l.match(/^\s*\/\/(::.*)$/))
                         .filter(v => v !== null)
                         .map(v => {console.log(v[1]); return v;})
                         .map(m => toString(fromString(m[1])))
                         .join("\n\n");

    const prefix  = options.prefix || 'SIGNATURES>>>';
    const postfix = options.postfix || '<<<SIGNATURES';
    let rx        = new RegExp(`${prefix}[\\s\\S]*${postfix}`);
    let wrapped   = `${prefix}\n${signatures}\n//${postfix}`;

    if (code.match(rx) !== null) {
        return code.replace(rx, wrapped);
    } else {
        return code + "\n\n//" + wrapped;
    }
}


module.exports = addToCode;


