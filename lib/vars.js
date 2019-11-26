/* eslint-disable no-console */
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const propParser = require('node-properties-parser');
require('./theme.js');

function resolveVarsFromContext(template, context) {
  const parsed = handlebars.compile(template);
  const result = parsed(context);
  return JSON.parse(result);
}

exports.resolveVars = function resolveVars(template) {
  const apiKeyFile = path.join(process.env.HOME, 'elastic.json');
  console.log('About to read file: %s'.info, apiKeyFile);
  const apiKeyFileExists = fs.existsSync(apiKeyFile);

  if (apiKeyFileExists) {
    console.log('Reading file %s'.info, apiKeyFile);
    const content = fs.readFileSync(apiKeyFile);
    const context = JSON.parse(content.toString());
    return resolveVarsFromContext(template, context);
  }

  console.log('File does not exist: %s'.warn, apiKeyFile);
  return JSON.parse(template);
};

function readEnvVars() {
  const envFile = path.join(process.env.HOME, '.env');
  const exists = fs.existsSync(envFile);

  if (exists) {
    const content = fs.readFileSync(envFile);
    return propParser.parse(content);
  }

  console.log('File %s does not exist'.warn, envFile);
  return {};
}

exports.provideProcessWithEnvVars = function provideProcessWithEnvVars() {
  const envVars = readEnvVars();

  Object.keys(envVars).forEach((key) => {
    process.env[key] = envVars[key];
  });
};
