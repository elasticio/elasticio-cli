/* eslint-disable no-console */
const program = require('commander');
require('./theme.js');
const vars = require('./vars.js');
const helpers = require('./helpers.js');
const prompt = require('./prompt.js');

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
      console.log(err.stack);
    } else {
      console.log("Function '%s' executed successfully".info, fn.name);

      if (data) {
        console.log('Function returned following data:'.info);
        console.log(helpers.formatObject(data).info);
      }
    }

    helpers.destroyProcess();
  };

  const snapshot = fixture.snapshot || {};

  try {
    fn.apply({}, [fixture.msg, cfg, callback, snapshot]);
  } catch (e) {
    console.log(e.stack);
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
