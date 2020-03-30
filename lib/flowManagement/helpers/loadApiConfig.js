const expandTilde = require('expand-tilde');
const envLoader = require('dotenv-extended');
const path = require('path');
const PlatformApiClient = require('./platformApiClient');

module.exports.loadApiConfig = function loadApiConfig(logger, settingsFilePath) {
  if (!process.env.PLATFORM_EMAIL) {
    const settingsFile = expandTilde(settingsFilePath || '~/.integration-platform-cli-config.env');
    envLoader.load({
      path: settingsFile,
      schema: path.resolve(__dirname, '.env.schema'),
      errorOnMissing: true,
      errorOnExtra: true,
    });
  }

  if (!process.env.PLATFORM_EMAIL) {
    throw new Error('Missing email.');
  }
  const userEmail = process.env.PLATFORM_EMAIL.trim();

  if (!process.env.PLATFORM_API_KEY) {
    throw new Error('Missing API Key');
  }
  const apiKey = process.env.PLATFORM_API_KEY.trim();

  const baseApiUrl = process.env.PLATFORM_API_URL ? process.env.PLATFORM_API_URL : 'https://api.elastic.io';

  return new PlatformApiClient({ logger }, {
    resourceServerUrl: baseApiUrl,
    username: userEmail,
    password: apiKey,
  });
};
