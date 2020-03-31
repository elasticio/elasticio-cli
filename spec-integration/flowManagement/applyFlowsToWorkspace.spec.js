const fs = require('fs');
const { Logger } = require('@elastic.io/component-commons-library');

const { applyFlowsToWorkspace } = require('../../lib/flowManagement/executables/applyFlowsToWorkspace');
const { snapshotWorkspace } = require('../../lib/flowManagement/executables/snapshotWorkspace');
const { loadApiConfig } = require('../../lib/flowManagement/helpers/loadApiConfig');

const logger = Logger.getLogger();

if (fs.existsSync('.env')) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

const contractId = '5e81f351f926af23f2d72290';
const sampleExtractFolder = 'tmp/integrationTestExtract';

describe('Apply Flow to Workspace Tests', function applyFlowToWorkspaceTests() {
  this.timeout(120000);
  const client = loadApiConfig(logger);
  let workspaceId;

  beforeEach(async () => {
    workspaceId = (await client.makeRequest({
      method: 'POST',
      url: '/workspaces',
      body: {
        data: {
          type: 'workspace',
          attributes: {
            name: 'Integration Test Workspace',
          },
          relationships: {
            contract: {
              data: {
                id: contractId,
                type: 'contract',
              },
            },
          },
        },
      },
    })).data.id;
    fs.mkdirSync(sampleExtractFolder, { recursive: true });
  });

  afterEach(async () => {
    await client.makeRequest({
      method: 'DELETE',
      url: `/workspaces/${workspaceId}`,
    });
    fs.rmdirSync(sampleExtractFolder, { recursive: true });
  });

  it('Create Workspace and Apply Flows', async () => {
    // Create needed credentials
    await client.makeRequest({
      method: 'POST',
      url: '/credentials',
      body: {
        data: {
          type: 'credential',
          attributes: {
            name: 'Petstore',
            keys: {
              apiKey: 'elasticio',
            },
          },
          relationships: {
            component: {
              data: {
                id: '5a26a1d1103597001975bee3',
                type: 'component',
              },
            },
            workspace: {
              data: {
                id: workspaceId,
                type: 'workspace',
              },
            },
          },
        },
      },
    });
    await client.makeRequest({
      method: 'POST',
      url: '/credentials',
      body: {
        data: {
          type: 'credential',
          attributes: {
            name: 'REST',
            keys: {
              auth: {
                type: 'No Auth',
                basic: {
                  username: '',
                  password: '',
                },
                digest: {
                  username: '',
                  realm: '',
                  password: '',
                  nonce: '',
                  algorithm: '',
                  qop: '',
                  nonceCount: '',
                  clientNonce: '',
                  opaque: '',
                },
                apiKey: {
                  headerName: '',
                  headerValue: '',
                },
              },
            },
          },
          relationships: {
            component: {
              data: {
                id: '59df8d792081010019391f81',
                type: 'component',
              },
            },
            workspace: {
              data: {
                id: workspaceId,
                type: 'workspace',
              },
            },
          },
        },
      },
    });
    await client.makeRequest({
      method: 'POST',
      url: '/credentials',
      body: {
        data: {
          type: 'credential',
          attributes: {
            name: 'No Auth',
            keys: {
              auth: {
                type: 'NO_AUTH',
                basic: {
                  username: '',
                  password: '',
                },
                apiKey: {
                  headerName: '',
                  headerValue: '',
                },
                hmacSecret: null,
                oauth2: {
                  clientId: '',
                  clientSecret: '',
                  authUri: '',
                  tokenUri: '',
                  scopes: [],
                  additionalProperties: {},
                },
              },
            },
          },
          relationships: {
            component: {
              data: {
                id: '55ba18e35d04040500000004',
                type: 'component',
              },
            },
            workspace: {
              data: {
                id: workspaceId,
                type: 'workspace',
              },
            },
          },
        },
      },
    });

    await applyFlowsToWorkspace({
      workspaceId,
      path: 'spec-integration/flowManagement/WorkspaceWithSampleFlows',
    }, {
      matchType: 'name',
    }, logger);

    // Start flows
    const flowIds = (await client.fetchAllFlowsFromWorkspace(workspaceId)).map((flow) => flow.id);
    await Promise.all(flowIds.map(async (flowId) => {
      await client.makeRequest({
        method: 'POST',
        url: `/flows/${flowId}/start`,
      });
    }));

    await snapshotWorkspace({
      workspaceId,
      path: sampleExtractFolder,
    }, {}, logger);
    await applyFlowsToWorkspace({
      workspaceId,
      path: sampleExtractFolder,
    }, {
      matchType: 'id',
    }, logger);
  });
});
