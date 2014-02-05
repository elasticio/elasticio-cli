var program = require('commander');
var fs = require('fs');
var theme = require('./theme.js');

program.prompt('Please enter library name: ', function (aName) {
    var name = aName.trim();

    program.prompt('Please enter library description: ', function (aDesc) {

        var description = aDesc;

        console.log("About to create library '%s'".info, name);
        console.log("Library's description: %s".info, description);


        if (fs.existsSync(name)) {
            console.log("Folder '%s' already exist".warn, name);

            return destroy();
        }

        var rootFolder = './' + name;

        fs.mkdirSync(rootFolder);

        console.log("Folder %s created".info, rootFolder);

        var libFolder = rootFolder + '/lib/';
        var descriptor = rootFolder + "/package.json";

        fs.mkdirSync(libFolder);

        console.log("Folder %s created".info, libFolder);

        var packageJson = {
            "name":name,
            "description":description,
            "version":"0.0.1",
            "engines":{
                "node":"0.8.7",
                "npm":"1.1.49"
            },

            "dependencies":{
                "underscore":"1.4.2",
                "underscore.string":"2.2.0rc",
                "request":"2.10.0",
                "node-uuid":"1.3.3",
                "async":"0.1.22",
                "moment":"1.7.2"
            }
        };

        fs.writeFileSync(descriptor, JSON.stringify(packageJson, null, '\t'), "utf8");

        console.log("File %s created".info, descriptor);

        destroy();
    });
});

var destroy = function () {
    process.stdin.destroy();
};




