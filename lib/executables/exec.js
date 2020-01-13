/* eslint-disable no-use-before-define */
const { print } = require('../helpers/log.js');
const utils = require('../helpers/utils.js');
const prompts = require('../helpers/prompts.js');
const { Emitter } = require('../helpers/emitter.js');

exports.runExec = async function runExec(componentPath, functionName, fixtureKey, action) {
  const verifyOrAction = functionName || action || await prompts.verifyOrAction();
  const fixture = await prompts.setupFixture(fixtureKey, componentPath);
  const actionData = await prompts.getActionPath(componentPath, verifyOrAction);
  const { path } = actionData;
  const actionName = actionData.name;

  utils.validateFixture(componentPath, fixture, actionName);

  const setup = await prompts.setupFunction(verifyOrAction, path);
  let func = setup.path;
  const funcName = setup.name;

  if (Object.keys(func).length) {
    func = func[Object.keys(func)[0]];
  }

  const emitter = new Emitter();
  const cfg = fixture.cfg || {};
  const msg = fixture.msg || {};
  const snapshot = fixture.snapshot || {};
  utils.provideProcessWithEnvVars(componentPath);

  print.info(`\nRunning function '${funcName}'`);
  print.info('\nResult: \n');

  if (funcName === 'verify') {
    // eslint-disable-next-line no-inner-declarations
    function doVerification(verify) {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        function legacyCallback(e, result) {
          if (e) {
            reject(e);
          }
          resolve(result);
        }
        try {
          const result = await verify.call(emitter, cfg, legacyCallback);
          if (result) {
            resolve(result);
          }
        } catch (e) {
          print.error(utils.formatObject({
            verified: false,
            reason: e.context || e.message,
          }));
        }
      });
    }


    doVerification(func)
      .then((result) => {
        if (!Object.keys(result).includes('verified')) {
          print.data(utils.formatObject({ verified: true }));
        } else {
          print.data(utils.formatObject(result));
        }
        return result;
      })
      .catch((e) => {
        print.error(utils.formatObject({
          verified: false,
          reason: e.context || e.message,
        }));
      });
  } else if (funcName === 'process') {
    await runFunction(func, emitter, [msg, cfg, snapshot]);
  } else {
    await runFunction(func, emitter, [cfg, snapshot]);
  }
};

const runFunction = async (func, emitter, params) => {
  try {
    const result = await func.apply(emitter, params);
    if (result) print.data(utils.formatObject(result));
  } catch (e) {
    print.error(e.stack);
  } finally {
    utils.destroyProcess();
  }
};
