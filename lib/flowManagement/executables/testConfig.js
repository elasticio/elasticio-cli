const { loadApiConfig } = require('../helpers/loadApiConfig');

exports.testConfig = async function (args, options, logger) {
    const client = loadApiConfig(logger, options.configFile);
    logger.info('Attempting to verify configuration...');
    const me = await client.makeRequest({
        url: '/users/me',
        method: 'GET'
    });
    const returnedEmail = me.data.attributes.email;
    if (returnedEmail !== client.username.toString()) {
        throw new Error(`Error: Returned email does not match! ${returnedEmail} vs ${client.username}`);
    }
    logger.info('Configuration successfully verified.');
};
