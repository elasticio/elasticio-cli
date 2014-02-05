var fs = require('fs');
var path = require('path');
var vars = require('./vars.js');
var theme = require('./theme.js');

var readFixture = function(componentPath) {

    var fixtureFile = findFixtureFile(componentPath);

    console.log("Reading test fixture from '%s'".info, fixtureFile);

    var fixtureFileExists = fs.existsSync(fixtureFile);

    if (!fixtureFileExists) {
        console.log('No fixture file found. Please define test fixtures in file test/fixture.json'.error);
        return null;
    }

    var content = fs.readFileSync(fixtureFile);

    var template = content.toString();

    var data = vars.resolveVars(template);

    return data.fixtures || {};
};

var findFixtureFile = function(componentPath) {
    var currentPath = componentPath;

    while(currentPath != '/') {
        var fixtureFile = path.resolve(currentPath, "./test/fixture.json");

        if(fs.existsSync(fixtureFile)) {
            return fixtureFile;
        }

        currentPath = path.resolve(currentPath, '..');
    }

    return null;
};

exports.readFixture = readFixture;