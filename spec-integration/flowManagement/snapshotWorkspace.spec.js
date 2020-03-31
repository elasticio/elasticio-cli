const { expect } = require('chai');
const fs = require('fs');
const { Logger } = require('@elastic.io/component-commons-library');
const dircompare = require('dir-compare');

const { snapshotWorkspace } = require('../../lib/flowManagement/executables/snapshotWorkspace');

const logger = Logger.getLogger();


if (fs.existsSync('.env')) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

const sampleExtractFolder = 'tmp/integrationTestExtract';
const workspaceToPull = '5e824ce2f926af4c4adc9521';

describe('Snapshot Workspace Tests', function snapshotWorkspaceTests() {
  this.timeout(10000);

  beforeEach(() => {
    fs.mkdirSync(sampleExtractFolder, { recursive: true });
  });

  afterEach(() => {
    fs.rmdirSync(sampleExtractFolder, { recursive: true });
  });

  it('Pull sample flows', async () => {
    await snapshotWorkspace({
      workspaceId: workspaceToPull,
      path: sampleExtractFolder,
    }, {}, logger);
    const res = dircompare.compareSync(sampleExtractFolder, 'spec-integration/flowManagement/WorkspaceWithSampleFlows', {
      compareContent: true,
    });
    expect(res.same).to.equal(true);
  });
});
