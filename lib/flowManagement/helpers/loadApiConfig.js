const expandTilde = require('expand-tilde');
const envLoader = require('dotenv-extended');
const removeTrailingSlash = require('remove-trailing-slash');
const { BasicAuthRestClient } = require('@elastic.io/component-commons-library');

module.exports.loadApiConfig = function (logger, settingsFilePath) {
    if (!process.env.PLATFORM_EMAIL) {
        const settingsFile = expandTilde(settingsFilePath || '~/.integration-platform-cli-config.env');
        envLoader.load({
            path: settingsFile,
            schema: `${__dirname}/.env.schema`,
            errorOnMissing: true,
            errorOnExtra: true
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
    const fullApiUrl = `${removeTrailingSlash(baseApiUrl.trim())}/v2`;

    return new BasicAuthRestClient({logger}, {
        resourceServerUrl: fullApiUrl,
        username: userEmail,
        password: apiKey
    });
};
