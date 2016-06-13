var program = require('commander');
var fs = require('fs');
var _ = require('underscore');
var theme = require('./theme.js');
var vars = require('./vars.js');
var fixture = require('./fixture.js');
var prompt = require('./prompt.js');
var helpers = require('./helpers.js');
var Scope = require('./scope.js').Scope;

program
    .option('-p, --path <path>', 'Path to the component file to be executed. Absolute or relative.')
    .option('-x, --fixture [key]', 'Key of the fixture providing configuration for the execution')
    .parse(process.argv);

var path = program.path;

if (!(path)) {
    program.help();
}

var destroy = function () {
    process.stdin.destroy();
};


var doExecute = function (fixture, fn) {
    var msg = fixture.msg || {};
    var cfg = fixture.cfg || {};
    var snapshot = fixture.snapshot || {};

    vars.provideProcessWithEnvVars();

    function onError(err) {
        console.log(err.stack);
    }

    function onData(newMsg) {
        console.log("Component returned following message:".info);
        console.log(helpers.formatObject(newMsg).info);
    }

    function onSnapshot(newSnapshot) {
        console.log("Component returned following snapshot:".info);
        console.log(helpers.formatObject(newSnapshot).info);
    }

    function onEnd() {
        console.log("Component execution done".info);

        helpers.destroyProcess();
    }

    var scope = new Scope()
        .on('error', onError)
        .on('data', onData)
        .on('snapshot', onSnapshot)
        .on('end', onEnd);

    try {
        fn.apply(scope, [msg, cfg, snapshot]);
    } catch (e) {
        console.log(e.stack);
        helpers.destroyProcess();
    }
};

prompt.retrieveFixture(program, path, function(fixture) {
    var component = helpers.resolveComponent(path);

    var fn = component['process'];

    doExecute(fixture, fn);
});

exports.program