/* eslint-disable no-console */
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const propParser = require('properties-parser');
const { print } = require('./theme.js');

function resolveVarsFromContext(template, context) {
  const parsed = handlebars.compile(template);
  const result = parsed(context);
  return JSON.parse(result);
}

exports.resolveVars = function resolveVars(template) {
  const apiKeyFile = path.join(process.env.HOME, 'elastic.json');
  print.info('Adding secret keys');
  const apiKeyFileExists = fs.existsSync(apiKeyFile);

  if (apiKeyFileExists) {
    print.info(`Reading file ${apiKeyFile}`);
    const content = fs.readFileSync(apiKeyFile);
    const context = JSON.parse(content.toString());
    return resolveVarsFromContext(template, context);
  }

  print.info('No secret keys found');
  return JSON.parse(template);
};

function readEnvVars() {
  print.info('Reading env variables');
  const envFile = path.join(process.env.HOME, '.env');
  const exists = fs.existsSync(envFile);

  if (exists) {
    const content = fs.readFileSync(envFile);
    return propParser.parse(content);
  }

  print.info('No env variables found');
  return {};
}

exports.provideProcessWithEnvVars = function provideProcessWithEnvVars() {
  const envVars = readEnvVars();

  Object.keys(envVars).forEach((key) => {
    process.env[key] = envVars[key];
  });
};
