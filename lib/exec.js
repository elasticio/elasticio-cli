const { print, ERROR } = require('./theme.js');
const vars = require('./vars.js');
const helpers = require('./helpers.js');
const prompt = require('./prompt.js');
const { Scope } = require('./scope.js');

exports.runExec = async function runExec(path, functionName, fixtureKey) {
  const fn = await prompt.retrieveFunctionName(functionName, path);
  const fixture = await prompt.retrieveFixture(fixtureKey, path);
  const cfg = fixture.cfg || {};
  const msg = fixture.msg || {};
  const snapshot = fixture.snapshot || {};
  const scope = new Scope();

  vars.provideProcessWithEnvVars();

  try {
    fn.apply(scope, [msg, cfg, snapshot]);
    helpers.destroyProcess();
  } catch (e) {
    print(e.stack, ERROR);
    helpers.destroyProcess();
  }
}
