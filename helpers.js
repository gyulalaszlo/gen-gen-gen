let Handlebars = require('handlebars');


function registerHelpers( helpersObjList ) {
    const helpers = helpersObjList.reduce(Object.assign, {});
    const regFn = name => Handlebars.registerHelper(name, helpers[name]);

    Object.keys(helpers).map(regFn);
}


module.exports = {registerHelpers};

