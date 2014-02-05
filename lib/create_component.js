var program = require('commander');
var fs = require('fs');
var theme = require('./theme.js');

var LIB_FOLDER = './lib/';

program.prompt('Please enter component id: ', function (aId) {
    var id = aId.trim();

    program.prompt('Please enter component title: ', function (aTitle) {

        var title = aTitle.trim();

        program.prompt('Please enter component description: ', function (aDesc) {

            var description = aDesc;

            console.log("About to create component '%s'".info, id);
            console.log("Component's title: %s".info, title);
            console.log("Component's description: %s".info, description);

            if(!fs.existsSync(LIB_FOLDER)) {

                fs.mkdirSync(LIB_FOLDER);

                console.log("Folder '%s' created".warn, LIB_FOLDER);
            }


            var componentFolder = LIB_FOLDER + id;
            var componentPath = componentFolder + "/component.json";

            if (fs.existsSync(componentFolder)) {
                console.log("Folder '%s' already exist".warn, componentFolder);

                return destroy();
            }

            fs.mkdirSync(componentFolder);

            console.log("Folder %s created".info, componentFolder);

            var componentJson = {
                "title":title,
                "description":description
            };

            fs.writeFileSync(componentPath, JSON.stringify(componentJson, null, '\t'), "utf8");

            console.log("File %s created".info, componentPath);

            destroy();
        });
    });
});

var destroy = function(){
    process.stdin.destroy();
};




