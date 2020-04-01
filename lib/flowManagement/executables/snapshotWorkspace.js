const { loadApiConfig } = require('../helpers/loadApiConfig');
const { FsHelper } = require('../helpers/fsHelper');

const flowLevelPropertiesToSkip = [
  'created_at',
  'current_status',
  'last_stop_time',
  'last_modified',
  'last_start_time',
  'status',
  'updated_at',
];
const nodeLevelPropertiesToSkip = [
  'selected_data_samples',
  'dynamic_metadata',
  'dynamic_select_model',
];

exports.snapshotWorkspace = async function snapshotWorkspace(args, options, logger) {
  const client = loadApiConfig(logger, options.configFile);
  const { workspaceId } = args;
  const fsHelper = new FsHelper(args.path);
  const { matchType } = options;

  if (!workspaceId) {
    throw new Error('Workspace ID is required.');
  }

  logger.info(`Attempting to extract workspace ${workspaceId} from ${client.cfg.resourceServerUrl} to ${fsHelper.filePathRoot}...`);

  const flowsPromise = client.fetchAllFlowsFromWorkspace(workspaceId);
  const allFlowFilesPromise = fsHelper.lsHjsonFiles();
  const [flows, allFlowFiles] = await Promise.all([flowsPromise, allFlowFilesPromise]);
  const flowNamesToIds = allFlowFiles.reduce((dic, flowFileName) => {
    if (matchType === 'id') {
      return {};
    }
    const flowInfo = fsHelper.parseFlowFilename(flowFileName);
    if (dic[flowInfo.flowName]) {
      throw new Error(`Match by name failed: More that one flow with name ${flowInfo.flowName}`);
    }
    // eslint-disable-next-line no-param-reassign
    dic[flowInfo.flowName] = flowInfo.flowId;
    return dic;
  }, {});

  logger.info(`Will extract ${flows.length} flow(s).`);

  const allCreatedFlowFilenames = [];

  // Write each flow & its samples to a file
  /* eslint-disable no-param-reassign */
  await Promise.all(flows.map(async (flow) => {
    const promises = [];
    const flowId = (matchType === 'name') ? flowNamesToIds[flow.attributes.name] : flow.id;
    const flowFilenameInfo = fsHelper.buildPathsForFlowFile(flow.attributes.name, flowId);
    allCreatedFlowFilenames.push(flowFilenameInfo.flowFileName);

    await fsHelper.createfolder(flowFilenameInfo.sampleFolderName);

    const sampleIds = flow.attributes.graph.nodes
      .filter((node) => node.selected_data_samples && node.selected_data_samples.length >= 1)
      .map((node) => ({
        sampleId: node.selected_data_samples[0],
        stepId: node.id,
      }));
    promises.push(...sampleIds.map(async (sampleInfo) => {
      const sampleRequest = await client.makeRequest({
        method: 'GET',
        url: `/data-samples/${sampleInfo.sampleId}`,
      });
      const sample = sampleRequest.data.attributes;
      const {
        sampleFilePath,
      } = fsHelper.buildPathForSampleFile(flowFilenameInfo.sampleFolderPath, sampleInfo.stepId);
      await fsHelper.writeHjsonFile(sampleFilePath, sample);
    }));

    // Write flow file
    flowLevelPropertiesToSkip.forEach((flowLevelPropertyToSkip) => {
      delete flow.attributes[flowLevelPropertyToSkip];
    });
    flow.attributes.graph.nodes.forEach((node) => {
      nodeLevelPropertiesToSkip.forEach((nodeLevelPropertyToSkip) => {
        delete node[nodeLevelPropertyToSkip];
      });
    });
    promises.push(fsHelper.writeHjsonFile(flowFilenameInfo.flowFileName, flow.attributes));
    await Promise.all(promises);

    // Remove old sample files
    const allSampleFilenames = await fsHelper.lsHjsonFiles(flowFilenameInfo.sampleFolderPath);
    const allCreatedSampleFilenames = sampleIds
    // eslint-disable-next-line max-len
      .map((sampleInfo) => fsHelper.buildPathForSampleFile(flowFilenameInfo.sampleFolderPath, sampleInfo.stepId).sampleFileName);
    const oldSampleFileNames = allSampleFilenames
      .filter((fileName) => !allCreatedSampleFilenames.includes(fileName));

    await Promise.all(oldSampleFileNames.map(async (oldSampleFileName) => {
      await fsHelper.removeOldFiles(oldSampleFileName);
    }));
  }));
  /* eslint-enable no-param-reassign */

  // Delete old flow files
  const oldFlowFileNames = allFlowFiles
    .filter((fileName) => !allCreatedFlowFilenames.includes(fileName));

  await Promise.all(oldFlowFileNames.map(async (oldFlowFileName) => {
    await fsHelper.removeOldFiles(oldFlowFileName);
  }));

  logger.info('Operation complete.');
};
