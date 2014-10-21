var util = require('util');
var _ = require('underscore');
var fs = require('fs');

var COMMANDS = {
    'cmp:process' : {
        main: './process.js',
        options: true
    },
    'cmp:exec' : {
        main: './exec.js',
        options: true
    },
    'cmp:create' : {
        main: './create_component.js'
    } ,
    'lib:create' : {
        main: './create_lib.js'
    },
    'oauth2': {
        main: './oauth2/index.js',
        options: true
    }
};

var NEW_LINE = '\n';

var print = function(value) {
    process.stdout.write(value + '\n');
};

var printAndExit = function (value) {
    print(value);

    process.exit();
};

var help = function () {
    printAndExit(helpInfo());
};

var helpInfo = function () {

    var commandNames = _.keys(COMMANDS);

    var version = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version;

    var help =
        NEW_LINE +
        '  elastic.io tools ' + version +
        NEW_LINE +
        NEW_LINE +
        '  Options:' +
        NEW_LINE +
        NEW_LINE ;

    var options = _.map(commandNames, function(name){

        var result = '  ' + name;

        var componentInfo = COMMANDS[name];

        if(componentInfo.options) {
            result += ' <options>';
        }

        return result;
    });

    return help + options.join(NEW_LINE);
};

var args = process.argv;

if (args.length < 3) {
    help();
}


var command = args[2];

var commandInfo = COMMANDS[command];

if(!commandInfo) {
    printAndExit(util.format('%s is unknown command', command));
}

require(commandInfo.main);

