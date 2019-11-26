const program = require('commander');
const { print } = require('./theme.js');
const vars = require('./vars.js');
const helpers = require('./helpers.js');
const prompt = require('./prompt.js');

const INFO = 'info';
const ERROR = 'error';

program
  .option('-p, --path <path>', 'Path to the component file to be executed. Absolute or relative.')
  .option('-f, --function [key]', 'Function name to be executed')
  .option('-x, --fixture [key]', 'Key of the fixture providing configuration for the execution')
  .parse(process.argv);

const { path } = program;

if (!(path)) {
  program.help();
}

const doExecute = (fixture, fn) => {
  const cfg = fixture.cfg || {};

  vars.provideProcessWithEnvVars();

  const callback = (err, data) => {
    if (err) {
      print(err.stack, ERROR);
    } else {
      print(`Function ${fn.name} executed successfully`, INFO);

      if (data) {
        print('Function returned following data:', INFO);
        print(helpers.formatObject(data), INFO);
      }
    }

    helpers.destroyProcess();
  };

  const snapshot = fixture.snapshot || {};

  try {
    fn.apply({}, [fixture.msg, cfg, callback, snapshot]);
  } catch (e) {
    print(e.stack, ERROR);
    helpers.destroyProcess();
  }
};

prompt.retrieveFixture(program, path, (fixture) => {
  if (fixture) {
    prompt.retrieveFunctionName(program, path, (functionName) => {
      doExecute(fixture, functionName);
    });
  }
});

exports.program = program;
