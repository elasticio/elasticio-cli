/* eslint-disable no-console */
const program = require('commander');
require('./theme.js');
const vars = require('./vars.js');
const prompt = require('./prompt.js');
const helpers = require('./helpers.js');
const { Scope } = require('./scope.js');

program
  .option('-p, --path <path>', 'Path to the component file to be executed. Absolute or relative.')
  .option('-x, --fixture [key]', 'Key of the fixture providing configuration for the execution')
  .parse(process.argv);

const { path } = program;

console.log(path);

if (!(path)) {
  program.help();
}

const doExecute = function doExecute(fixture, fn) {
  const msg = fixture.msg || {};
  const cfg = fixture.cfg || {};
  const snapshot = fixture.snapshot || {};

  vars.provideProcessWithEnvVars();

  const onError = (err) => {
    console.log(err.stack);
  };

  const onData = (newMsg) => {
    console.log('Component returned following message:'.info);
    console.log(helpers.formatObject(newMsg).info);
  };

  const onSnapshot = (newSnapshot) => {
    console.log('Component returned following snapshot:'.info);
    console.log(helpers.formatObject(newSnapshot).info);
  };

  const onEnd = () => {
    console.log('Component execution done'.info);
    helpers.destroyProcess();
  };

  const scope = new Scope();
  scope.on('error', onError)
    .on('data', onData)
    .on('snapshot', onSnapshot)
    .on('end', onEnd);

  try {
    fn.apply(scope, [msg, cfg, snapshot]);
    helpers.destroyProcess();
  } catch (e) {
    console.log(e.stack);
    helpers.destroyProcess();
  }
};

prompt.retrieveFixture(program, path, (fixture) => {
  const component = helpers.resolveComponent(path);

  const fn = component.process;

  doExecute(fixture, fn);
});

exports.program = program;
