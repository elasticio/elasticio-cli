/* eslint-disable no-console */
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const propParser = require('node-properties-parser');
const { print, INFO, WARN } = require('./theme.js');


function resolveVarsFromContext(template, context) {
  const parsed = handlebars.compile(template);
  const result = parsed(context);
  return JSON.parse(result);
}

exports.resolveVars = function resolveVars(template) {
  const apiKeyFile = path.join(process.env.HOME, 'elastic.json');
  print(`About to read file: ${apiKeyFile}`, INFO);
  const apiKeyFileExists = fs.existsSync(apiKeyFile);

  if (apiKeyFileExists) {
    print(`Reading file ${apiKeyFile}`, INFO);
    const content = fs.readFileSync(apiKeyFile);
    const context = JSON.parse(content.toString());
    return resolveVarsFromContext(template, context);
  }

  print(`File does not exist: ${apiKeyFile}`, WARN);
  return JSON.parse(template);
};

function readEnvVars() {
  const envFile = path.join(process.env.HOME, '.env');
  const exists = fs.existsSync(envFile);

  if (exists) {
    const content = fs.readFileSync(envFile);
    return propParser.parse(content);
  }

  print(`File ${envFile} does not exist`, WARN);
  return {};
}

exports.provideProcessWithEnvVars = function provideProcessWithEnvVars() {
  const envVars = readEnvVars();

  Object.keys(envVars).forEach((key) => {
    process.env[key] = envVars[key];
  });
};
