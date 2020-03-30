const expandTilde = require('expand-tilde');
const { loadApiConfig } = require('../helpers/loadApiConfig');
const { readHjsonFile, lsHjsonFiles, buildPath } = require('../helpers/fsHelpers');

exports.applyFlowsToWorkspace = async function applyFlowsToWorkspace(args, options, logger) {
  const client = loadApiConfig(logger, options.configFile);
  const { workspaceId } = args;
  const readPath = expandTilde(args.path);
  const { matchType } = options;

  if (!workspaceId) {
    throw new Error('Workspace ID is required.');
  }

  logger.info(`Attempting to apply workspace ${workspaceId} from ${readPath} to ${client.cfg.resourceServerUrl} ...`);

  const flowFilenamesPromise = lsHjsonFiles(readPath);
  const existingFlowsPromise = client.fetchAllFlowsFromWorkspace(workspaceId);
  const credentialsPromise = client.makeRequest({
    url: `/credentials/?workspace_id=${workspaceId}`,
    method: 'GET',
  });
  const [
    flowFilenames,
    existingFlows,
    credentials,
  ] = await Promise.all([flowFilenamesPromise, existingFlowsPromise, credentialsPromise]);

  logger.info(`Will insert ${flowFilenames.length} flow(s)`);

  await Promise.all(flowFilenames.map(async (flowFilename) => {
    const flowFileParts = flowFilename.split('.');
    const flowId = flowFileParts[flowFileParts.length - 3];
    const flowName = decodeURIComponent(flowFileParts.slice(0, -3).join('.'));

    const matchingFlows = existingFlows.filter((flow) => (matchType === 'name'
      ? flow.attributes.name === flowName
      : flow.id === flowId));

    if (matchingFlows.length > 1) {
      throw new Error(`More than one matching flow for flow with name '${flowName}' and id '${flowId}'`);
    }

    const flowPromise = readHjsonFile(readPath, flowFilename);
    const sampleFolderPath = buildPath(readPath, `${flowFilename.slice(0, '.hjson'.length * -1)}.samples`);
    const listOfSamplesPromise = lsHjsonFiles(sampleFolderPath);
    const [flow, listOfSamplesNames] = await Promise.all([flowPromise, listOfSamplesPromise]);

    /* eslint-disable no-param-reassign */
    await Promise.all(flow.graph.nodes.map(async (node) => {
      // Transform credentials
      if (node.credentials_id && matchType === 'name') {
        const matchingCredentials = credentials.data
          .filter((c) => c.relationships.component.data.id === node.component_id);
        if (matchingCredentials.length !== 1) {
          throw new Error(`Expected exactly 1 credential for ${node.command} Instead found ${matchingCredentials.length}`);
        }
        node.credentials_id = matchingCredentials[0].id;
      }

      // Store data sample
      const sampleFileName = `${node.id}.sample.hjson`;
      if (listOfSamplesNames.includes(sampleFileName)) {
        const sample = await readHjsonFile(sampleFolderPath, sampleFileName);

        const sampleRequest = {
          data: {
            type: 'data-sample',
            attributes: sample,
            relationships: {
              component: {
                data: {
                  id: node.component_id,
                  type: 'component',
                },
              },
              component_version: {
                data: {
                  id: 'latest',
                  type: 'version',
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
        };
        const sampleCreationRequestResult = await client.makeRequest({
          method: 'POST',
          url: '/data-samples',
          body: sampleRequest,
        });
        node.selected_data_samples = [sampleCreationRequestResult.data.id];
      }
    }));
    /* eslint-enable no-param-reassign */

    // create/update flow
    if (matchingFlows.length === 0) {
      await client.makeRequest({
        method: 'POST',
        url: '/flows',
        body: {
          data: {
            attributes: flow,
            relationships: {
              workspace: {
                data: {
                  type: 'workspace',
                  id: workspaceId,
                },
              },
            },
            type: 'flow',
          },
        },
      });
      return;
    }

    const matchingFlow = matchingFlows[0];
    const restartFlow = (matchingFlow.current_status === 'active');
    if (restartFlow) {
      await client.stopFlow(matchingFlow.flowId);
    }
    await client.makeRequest({
      method: 'PATCH',
      url: `/flows/${matchingFlow.flowId}`,
      body: {
        data: {
          type: 'flow',
          id: matchingFlow.flowId,
          attributes: flow,
        },
      },
    });
    if (restartFlow) {
      await client.startFlow(matchingFlow.flowId);
    }
  }));

  logger.info('Operation complete.');
};
