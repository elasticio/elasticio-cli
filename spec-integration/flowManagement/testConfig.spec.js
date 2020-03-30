const chai = require('chai');
const fs = require('fs');
const chaiAsPromised = require('chai-as-promised');
const { Logger } = require('@elastic.io/component-commons-library');
const mockFs = require('mock-fs');

const { testConfig } = require('../../lib/flowManagement/executables/testConfig');

const logger = Logger.getLogger();
chai.use(chaiAsPromised);
const { expect } = chai;

if (fs.existsSync('.env')) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

describe('Test Config Tests', () => {
  let originalPlatformEmail;
  let originalPlatformApiKey;
  let originalPlatformUrl;

  beforeEach(() => {
    originalPlatformEmail = process.env.PLATFORM_EMAIL;
    originalPlatformApiKey = process.env.PLATFORM_API_KEY;
    originalPlatformUrl = process.env.PLATFORM_API_URL;
  });

  afterEach(() => {
    process.env.PLATFORM_EMAIL = originalPlatformEmail;
    process.env.PLATFORM_API_KEY = originalPlatformApiKey;
    process.env.PLATFORM_API_URL = originalPlatformUrl;

    mockFs.restore();
  });

  describe('Read from Config File', () => {
    let envFileContents;

    beforeEach(() => {
      delete process.env.PLATFORM_EMAIL;
      delete process.env.PLATFORM_API_KEY;
      delete process.env.PLATFORM_API_URL;

      envFileContents = `PLATFORM_EMAIL="${originalPlatformEmail}"\nPLATFORM_API_KEY="${originalPlatformApiKey}"\n# Defaults to https://api.elastic.io\nPLATFORM_API_URL=${originalPlatformUrl}`;
    });

    it('Default Config File', async () => {
      const envSchemaFile = fs.readFileSync('./lib/flowManagement/helpers/.env.schema').toString();
      mockFs({
        [`${process.env.HOME}/.integration-platform-cli-config.env`]: envFileContents,
        'lib/flowManagement/helpers/.env.schema': envSchemaFile,
      });
      await testConfig({}, {}, logger);
    });

    it('Alternate Config File', async () => {
      const envSchemaFile = fs.readFileSync('./lib/flowManagement/helpers/.env.schema').toString();
      mockFs({
        [`${process.env.HOME}/.other-config.env`]: envFileContents,
        'lib/flowManagement/helpers/.env.schema': envSchemaFile,
      });
      await testConfig({}, {
        configFile: '~/.other-config.env',
      }, logger);
    });
  });

  describe('Read from env vars', () => {
    it('Correct credentials', async () => {
      await testConfig({}, {}, logger);
    });

    it('Incorrect credentials', async () => {
      process.env.PLATFORM_API_KEY = 'SomeWrongValue';
      expect(testConfig({}, {}, logger)).to.be.rejectedWith(Error);
    });
  });
});
