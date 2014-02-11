var Logger = require('./logger.js').Logger;
var request = require('request');

var Scope = function () {
    "use strict";
    this.logger = new Logger();
    this.request = request;
};

Scope.prototype.logger = function () {
    return this.logger;
};

Scope.prototype.request = function () {
	return this.request;
}

exports.Scope = Scope;