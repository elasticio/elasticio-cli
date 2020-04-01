#!/usr/bin/env node

const program = require('caporal');
const fs = require('fs');
const nodePath = require('path');

const { runProcess } = require('./lib/component/executables/process');
const { runExec } = require('./lib/component/executables/exec');
const { runValidate } = require('./lib/component/executables/validate');

const { testConfig } = require('./lib/flowManagement/executables/testConfig');
const { snapshotWorkspace } = require('./lib/flowManagement/executables/snapshotWorkspace');
const { applyFlowsToWorkspace } = require('./lib/flowManagement/executables/applyFlowsToWorkspace');

const { version } = JSON.parse(fs.readFileSync(nodePath.resolve(__dirname, 'package.json'), 'utf8'));

program
  .version(version);

// Make winston logger bunyan compatible
const logger = program.logger();
logger.trace = logger.debug;

program
  .command('cmp:process', 'Run the startup, init, process, and shutdown function of an action/trigger. Only the process is mandatory')
  .argument('[path]', 'Path to component folder, defaults to current directory', null, process.cwd())
  .option('-x, --fixture [fixture]', 'Fixture to run against')
  .option('-a, --action [action]', 'Name of action/trigger to run')
  .action(async (args, options) => {
    const { fixture, action } = options;
    const { path } = args;
    await runProcess(path, fixture, action);
  });

program
  .command('cmp:exec', 'Run any exposed function from a file, including verifyCredentials')
  .argument('[path]', 'Path to component folder, defaults to current directory', null, process.cwd())
  .option('-x, --fixture [fixture]', 'Fixture to run against')
  .option('-f, --function [func]', 'Function name to run')
  .option('-a, --action [action]', 'Name of action/trigger to run')
  .action(async (args, options) => {
    const { fixture, action } = options;
    const func = options.function;
    const { path } = args;
    await runExec(path, func, fixture, action);
  });

program
  .command('cmp:validate', 'Validate component.json, action/trigger files, and any static schemas')
  .argument('[path]', 'Path to component folder', null, process.cwd())
  .action(async (args) => {
    await runValidate(args.path);
  });

program
  .command('api:testConfig', 'Verify that the configuration in the provided .env file is valid.')
  .option('-c, --configFile [path]', '.env file to use for API key information. Defaults to environment variables and then ~/.integration-platform-cli-config.env if omitted.')
  .action(testConfig);

program
  .command('api:snapshotWorkspace', 'Extract all the flows and related sample data to the current folder.')
  .argument('[workspaceId]', 'ID of the workspace to extract.')
  .argument('[path]', 'Path to extract files to (defaults to current directory)', null, process.cwd())
  .option('-m, --matchType', 'Logic to match files to existing flows.  Options are: \'id\' (default) or \'name\'',
    ['id', 'name'], 'id')
  .option('-c, --configFile [path]', '.env file to use for API key information. Defaults to environment variables and then ~/.integration-platform-cli-config.env if omitted.')
  .action(snapshotWorkspace);

program
  .command('api:applyFlowsToWorkspace', 'Take all flows in the given directory and apply them to the workspace.')
  .argument('[workspaceId]', 'ID of the workspace to apply flows to.')
  .argument('[path]', 'Path of folder with files to (defaults to current directory)', null, process.cwd())
  .option('-m, --matchType', 'Logic to match files to existing flows.  Options are: \'id\' (default) or \'name\'',
    ['id', 'name'], 'id')
  .option('-c, --configFile [path]', '.env file to use for API key information. Defaults to environment variables and then ~/.integration-platform-cli-config.env if omitted.')
  .action(applyFlowsToWorkspace);

program.parse(process.argv);
