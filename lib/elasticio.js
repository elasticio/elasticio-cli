const program = require('caporal');
const fs = require('fs');
const { runProcess } = require('./process');
const { runExec } = require('./exec');

const { version } = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`, 'utf8'));

program
  .version(version);

program
  .command('cmp:process', 'Run the process function of an action/trigger')
  .argument('<path>', 'Path to file with process function')
  .argument('[fixture]', 'Fixture to run against')
  .action(async (args) => {
    const { path, fixture } = args;
    await runProcess(path, fixture);
  });

program
  .command('cmp:exec <path> [func] [fixture]')
  .description('Run component actions')
  .action(async (path, func, fixture) => {
    await runExec(path, func, fixture);
  });

program.parse(process.argv);

if (process.argv.length < 3) {
  program.help();
}
