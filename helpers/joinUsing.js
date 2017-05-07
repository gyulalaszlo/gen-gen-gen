let Handlebars = require('handlebars');

function flatten(arr) {
    return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
}

let str = s => new Handlebars.SafeString(s);

let strList = v => v ? [v] : [];

// let strWrapJoin = (pre="",post="",joiner="",ss) =>
//     str(flatten([pre,post,ss].map(strList)).join(joiner));

let strWrap = (pre, post, v) => strWrapJoin(pre, post, "", v);


function strWrapJoin(pre = "", post = "", joiner = "", ss = []) {
    let a = [pre, ss, post].map(strList);
    let b = flatten(a);
    let c = b.join(joiner);
    // return joiner;
    // return JSON.stringify(joiner);
    return c;
}

const kv = (v, k) => ({key: k, value: v});

const iter = els => {
    if (Array.isArray(els)) {
        return els.map(kv);
    }
    return Object.keys(els).map(k => kv(els[k], k));
};


const notEmpty = els => els && ((Array.isArray(els) ? els : Object.keys(els)).length > 0);

module.exports = {


    join: (els = [], opts) => {

        if (typeof els === "undefined" || els === null) {
            return "";
        }

        if (typeof els === "string") {
            els = [els]
        }

        if (typeof opts === "undefined") opts = els || {};
        let h     = opts.hash || {};
        let first = h.first || "";
        let last  = h.last || "";

        // the join string
        let hasIndent = (typeof h.indent === "number");
        let hasLineStart = (typeof h.lines === "string");

        let indentStr = "";
        let lineStr = "\n";
        if (hasIndent) {
            for (let i =0; i < h.indent; ++i) {
                indentStr +=  "    ";
            }
        } else if (hasLineStart) {
            indentStr = h.lines;
        } else {
            lineStr = "";
        }




        // let indentStr = (typeof h.lines === "undefined" ? "" : "\n" + h.lines);
        let joinStr =  lineStr + indentStr + (h.joiner || "");

        const blockParams = val => [val.key, val.value];
        const fnOpts      = v => ({data: opts.data, blockParams: blockParams(v)});
        const innerFn     = fn => v => fn ? fn(v, fnOpts(v)) : v.value;

        const vals = iter(els).map(innerFn(opts.fn));

        const wrapped = notEmpty(vals) ? strWrapJoin(h.appendFirst, h.appendLast, joinStr, vals) : innerFn(opts.inverse)(this);
        return str(strWrap(first, last, wrapped));
    }

};

