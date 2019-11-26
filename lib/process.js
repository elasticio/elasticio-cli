const program = require('commander');
const { print, INFO, ERROR } = require('./theme.js');
const vars = require('./vars.js');
const prompt = require('./prompt.js');
const helpers = require('./helpers.js');
const { Scope } = require('./scope.js');

program
  .option('-p, --path <path>', 'Path to the component file to be executed. Absolute or relative.')
  .option('-x, --fixture [key]', 'Key of the fixture providing configuration for the execution')
  .parse(process.argv);

const { path } = program;

if (!(path)) {
  program.help();
}

const doExecute = function doExecute(fixture, fn) {
  const msg = fixture.msg || {};
  const cfg = fixture.cfg || {};
  const snapshot = fixture.snapshot || {};

  vars.provideProcessWithEnvVars();

  const onError = (err) => {
    print(err.stack, ERROR);
  };

  const onData = (newMsg) => {
    print('Component returned following message:', INFO);
    print(helpers.formatObject(newMsg), INFO);
  };

  const onSnapshot = (newSnapshot) => {
    print('Component returned following snapshot:', INFO);
    print(helpers.formatObject(newSnapshot), INFO);
  };

  const onEnd = () => {
    print('Component execution done', INFO);
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
    print(e.stack, ERROR);
    helpers.destroyProcess();
  }
};

prompt.retrieveFixture(program, path, (fixture) => {
  const component = helpers.resolveComponent(path);

  const fn = component.process;

  doExecute(fixture, fn);
});

exports.program = program;
