var handlebars = require('hbs').handlebars;
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var propParser = require('node-properties-parser');
var theme = require('./theme.js');

var resolveVars = function (template) {

    var apiKeyFile = path.join(process.env['HOME'], 'elastic.json');

    console.log('About to read file: %s'.info, apiKeyFile);

    var apiKeyFileExists = fs.existsSync(apiKeyFile);

    if (apiKeyFileExists) {
        console.log('Reading file %s'.info, apiKeyFile);

        var content = fs.readFileSync(apiKeyFile);

        var context = JSON.parse(content.toString());

        return resolveVarsFromContext(template, context);
    } else {
        console.log('File does not exist: %s'.warn, apiKeyFile);

        return JSON.parse(template);
    }
};

var resolveVarsFromContext= function (template, context) {

    var parsed = handlebars.compile(template);

    var result = parsed(context);

    return JSON.parse(result);
};

var readEnvVars = function () {

    var envFile = path.join(process.env['HOME'], '.env');

    var exists = fs.existsSync(envFile);

    if (exists) {

        var content = fs.readFileSync(envFile);

        return propParser.parse(content);
    }else {
        console.log('File %s does not exist'.error, envFile);

        return null;
    }
};

var provideProcessWithEnvVars = function() {
    var envVars = readEnvVars();

    _.each(_.keys(envVars), function (key) {
        process.env[key] = envVars[key];
    });
};

exports.resolveVars = resolveVars;
exports.resolveVarsFromContext = resolveVarsFromContext;
exports.readEnvVars = readEnvVars;
exports.provideProcessWithEnvVars = provideProcessWithEnvVars;