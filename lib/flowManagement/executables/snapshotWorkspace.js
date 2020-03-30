const { loadApiConfig } = require('../helpers/loadApiConfig');
const { writeHjsonFile, createfolder, lsHjsonFiles, removeOldFiles } = require('../helpers/fsHelpers');
const expandTilde = require('expand-tilde');

const flowLevelPropertiesToSkip = [
    'created_at',
    'current_status',
    'last_stop_time',
    'last_modified',
    'last_start_time',
    'status',
    'updated_at'
];
const nodeLevelPropertiesToSkip = [
    'selected_data_samples',
    'dynamic_metadata'
];

exports.snapshotWorkspace = async function (args, options, logger) {
    const client = loadApiConfig(logger, options.configFile);
    const {workspaceId} = args;
    const writePath = expandTilde(args.path);

    if (!workspaceId) {
        throw new Error('Workspace ID is required.');
    }

    logger.info(`Attempting to extract workspace ${workspaceId} from ${client.cfg.resourceServerUrl} to ${writePath}...`);

    const flows = await client.fetchAllFlowsFromWorkspace(workspaceId);

    logger.info(`Will extract ${flows.length} flow(s).`);

    // Write each flow & its samples to a file
    await Promise.all(flows.map(async (flow) => {
        const promises = [];
        const filenameRoot = `${flow.attributes.name}.${flow.id}.flow`;

        const sampleFolderPath = await createfolder(writePath, `${filenameRoot}.samples`);

        const sampleIds = flow.attributes.graph.nodes
            .filter((node) => node.selected_data_samples && node.selected_data_samples.length >= 1)
            .map((node) => {return {
                sampleId: node.selected_data_samples[0],
                stepId: node.id,
            };});
        promises.push(... sampleIds.map(async (sampleInfo) => {
            const sampleRequest = await client.makeRequest({
                method: 'GET',
                url: `/data-samples/${sampleInfo.sampleId}`
            });
            const sample = sampleRequest.data.attributes;
            const sampleFileName = `${sampleInfo.stepId}.sample.hjson`;
            await writeHjsonFile(sampleFolderPath, sampleFileName, sample);
        }));

        // Write flow file
        for(const flowLevelPropertyToSkip of flowLevelPropertiesToSkip) {
            delete flow.attributes[flowLevelPropertyToSkip];
        }
        for(const node of flow.attributes.graph.nodes) {
            for(const nodeLevelPropertyToSkip of nodeLevelPropertiesToSkip) {
                delete node[nodeLevelPropertyToSkip];
            }
        }
        promises.push(writeHjsonFile(writePath, `${filenameRoot}.hjson`, flow.attributes));
        await Promise.all(promises);
    }));

    // Delete old flow files
    const allFlowFiles = await lsHjsonFiles(writePath);
    const allCreatedFlowFiles = flows.map(flow => encodeURIComponent(`${flow.attributes.name}.${flow.id}.flow.hjson`));
    const oldFlowFiles = allFlowFiles.filter(fileName => !allCreatedFlowFiles.includes(fileName)).map(fileName => fileName.slice(0, '.hjson'.length * -1));

    await Promise.all(oldFlowFiles.map(async(oldFlowFileName) => {
       await removeOldFiles(oldFlowFileName);
    }));

    logger.info('Operation complete.');
};
