var fixture = require('./fixture.js');
var fs = require('fs');
var util = require('util');
var _ = require('underscore');
var helpers = require('./helpers.js');
var theme = require('./theme.js');

const NEW_LINE = '\n';

var retrieveFixture = function (program, path, cb) {

    var componentPath = helpers.getComponentPath(path);

    var fixtures = fixture.readFixture(componentPath);

    if(!fixtures) {
        return cb();
    }

    var fixtureKey = program.fixture;

    var findFixtureByKey = function(key, callback) {
        var result = fixtures[key];

        if(!result) {
            console.log("Fixture '%s' does not exist".error, key);
            helpers.destroyProcess();

            return;
        }

        callback(result);
    };

    if (!fixtureKey) {
        var promptMsg = "Following fixture were found: " + toKeyList(fixtures) + "Please choose one: ";

        program.prompt(promptMsg, function (aFixture) {

            findFixtureByKey(aFixture.trim(), cb);
        });
    }else {
        findFixtureByKey(fixtureKey, cb);
    }
};

var retrieveFunctionName = function (program, path, cb) {

    var functionName = program.function;

    var component = helpers.resolveComponent(path);

    var findFunctionByName = function(name, callback) {

        var fn = component[name];

        if(!fn) {
            console.log("Function '%s' does not exist".error, name);
            helpers.destroyProcess();

            return;
        }

        callback(fn);

    };

    if (!functionName) {

        var promptMsg = "Following functions to execute were found: " + toKeyList(component) + "Please choose one: ";

        program.prompt(promptMsg, function (aFunction) {

            findFunctionByName(aFunction.trim(), cb);
        });
    } else {
        findFunctionByName(functionName, cb);
    }
};

var toKeyList = function (obj) {
    var keys = _.keys(obj);

    var result = NEW_LINE + NEW_LINE;

    _.each(keys, function (next) {
        result += util.format('- %s%s', next, NEW_LINE);
    });

    result += NEW_LINE;

    return result;
};

exports.retrieveFixture = retrieveFixture;
exports.retrieveFunctionName = retrieveFunctionName;