var program = require('commander');
var fs = require('fs');
var _ = require('underscore');
var theme = require('./theme.js');
var vars = require('./vars.js');
var fixture = require('./fixture.js');
var helpers = require('./helpers.js');
var prompt = require('./prompt.js');

program
    .option('-p, --path <path>', 'Path to the component file to be executed. Absolute or relative.')
    .option('-f, --function [key]', 'Function name to be executed')
    .option('-x, --fixture [key]', 'Key of the fixture providing configuration for the execution')
    .parse(process.argv);

var path = program.path;

if (!(path)) {
    program.help();
}

var doExecute = function (fixture, fn) {
    var cfg = fixture.cfg || {};

    vars.provideProcessWithEnvVars();

    var callback = function(err, data) {
        if (err) {
            console.log(err.stack);

        } else {


            console.log("Function '%s' executed successfully".info, fn.name);

            if (data) {
                console.log("Function returned following data:".info);
                console.log(helpers.formatObject(data).info);
            }
        }

        helpers.destroyProcess();
    };

    var snapshot = fixture.snapshot || {};

    try {
        fn.apply({}, [fixture.msg, cfg, callback, snapshot]);
    } catch (e) {
        console.log(e.stack);
        helpers.destroyProcess();
    }
};

prompt.retrieveFixture(program, path, function(fixture) {
    if(fixture) {
        prompt.retrieveFunctionName(program, path, function (functionName) {

            doExecute(fixture, functionName);
        });
    }
});

exports.program