var Logger = require('./logger.js').Logger;

var Scope = function () {
    "use strict";
    this.logger = new Logger();

};

Scope.prototype.logger = function () {
    return this.logger;
};

exports.Scope = Scope;