const program = require('commander');
const { runProcess } = require('./process');
const { runExec } = require('./exec');

program
  .command('cmp:process <path> [fixture]')
  .description('Run the process function of an action/trigger')
  .action(async (path, fixture) => {
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
