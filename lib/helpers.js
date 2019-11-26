const fs = require('fs');

function getComponentPath(path) {
  return fs.realpathSync(path, {});
}

exports.getComponentPath = getComponentPath;

exports.destroyProcess = function destroyProcess() {
  process.stdin.destroy();
};

exports.resolveComponent = function resolveComponent(path) {
  const componentPath = getComponentPath(path);

  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(componentPath);
};

exports.formatObject = function formatObject(obj) {
  return JSON.stringify(obj, null, 4);
};
