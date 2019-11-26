/* eslint-disable no-console */
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const propParser = require('properties-parser');
const { print, INFO } = require('./theme.js');

function resolveVarsFromContext(template, context) {
  const parsed = handlebars.compile(template);
  const result = parsed(context);
  return JSON.parse(result);
}

exports.resolveVars = function resolveVars(template) {
  const apiKeyFile = path.join(process.env.HOME, 'elastic.json');
  print('Adding secret keys', INFO);
  const apiKeyFileExists = fs.existsSync(apiKeyFile);

  if (apiKeyFileExists) {
    print(`Reading file ${apiKeyFile}`, INFO);
    const content = fs.readFileSync(apiKeyFile);
    const context = JSON.parse(content.toString());
    return resolveVarsFromContext(template, context);
  }

  print('No secret keys found', INFO);
  return JSON.parse(template);
};

function readEnvVars() {
  print('Reading env variables', INFO);
  const envFile = path.join(process.env.HOME, '.env');
  const exists = fs.existsSync(envFile);

  if (exists) {
    const content = fs.readFileSync(envFile);
    return propParser.parse(content);
  }

  print('No env variables found', INFO);
  return {};
}

exports.provideProcessWithEnvVars = function provideProcessWithEnvVars() {
  const envVars = readEnvVars();

  Object.keys(envVars).forEach((key) => {
    process.env[key] = envVars[key];
  });
};
