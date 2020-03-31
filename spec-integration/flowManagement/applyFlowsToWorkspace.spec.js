const { expect } = require('chai');
const fs = require('fs');
const { Logger } = require('@elastic.io/component-commons-library');

const { applyFlowsToWorkspace } = require('../../lib/flowManagement/executables/applyFlowsToWorkspace');
const { loadApiConfig } = require('../../lib/flowManagement/helpers/loadApiConfig');

const logger = Logger.getLogger();

if (fs.existsSync('.env')) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

const contractId = '5e81f351f926af23f2d72290';

describe('Apply Flow to Workspace Tests', function applyFlowToWorkspaceTests() {
  this.timeout(10000);

  it('Create Workspace and Apply Flows', async () => {
    const client = loadApiConfig(logger);

    const workspaceId = (await client.makeRequest({
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

    await client.makeRequest({
      method: 'DELETE',
      url: `/workspaces/${workspaceId}`,
    });
  });
});
