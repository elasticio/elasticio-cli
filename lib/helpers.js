var fs = require('fs');

var getComponentPath = function(path) {
    return fs.realpathSync(path, {});
};

exports.getComponentPath = getComponentPath;

exports.destroyProcess = function () {
    process.stdin.destroy();
};

exports.resolveComponent = function(path) {
    var componentPath = getComponentPath(path);

    return require(componentPath);
};

exports.formatObject = function (obj) {
    return JSON.stringify(obj, null, 4);
}