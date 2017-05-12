"use strict";

function defaultReject(str) {
    return Promise.reject(str);
}

// fancy error messages
module.exports = (msg, keys, rejecter=defaultReject) => e => {
    let reject = strs => rejecter(strs.join("\n"));
    if (typeof e === "string") {
        return reject([`---- ${msg}${e}`]);
    } else {
        keys         = keys || Object.keys(e).concat([]);

        const hasKey = k => (k in e) && k !== "message";

        const keyToS = v => k =>
        "  " + k + " = " + ((typeof v[k] === 'object')
            ? JSON.stringify(v[k])
            : v[k]);

        const stack = e =>
            (!(e.stack)
                ? []
                : (["", " stack -->"]
                 .concat(e.stack
                          .split(/[\r\n]+/)
                          .filter(l => l.match(/    at/)))))


        const lines = keys =>
            keys.filter(hasKey)
                .map(keyToS(e))
                .concat(stack(e))
                .join('\n');

        return reject([`---- ${msg}${e.message}`]
                          .concat(lines(keys)));
    }
};
