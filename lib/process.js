const { print } = require('./theme.js');
const vars = require('./globalVars.js');
const prompt = require('./prompt.js');
const helpers = require('./helpers.js');
const { Scope } = require('./scope.js');

exports.runProcess = async function runProcess(path, fixtureKey) {
  const fixture = await prompt.retrieveFixture(fixtureKey, path);
  const component = helpers.resolveComponent(path);

  const fn = component.process;

  const msg = fixture.msg || {};
  const cfg = fixture.cfg || {};
  const snapshot = fixture.snapshot || {};

  vars.provideProcessWithEnvVars();

  const scope = new Scope();

  try {
    fn.apply(scope, [msg, cfg, snapshot]);
  } catch (e) {
    print.error(e.stack);
  } finally {
    helpers.destroyProcess();
  }
};
