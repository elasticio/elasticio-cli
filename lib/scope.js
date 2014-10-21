var Logger = require('./logger.js').Logger;
var request = require('request');
var util = require('util');
var EventEmitter = require("events").EventEmitter;

var Scope = function () {
    EventEmitter.call(this);

    this.logger = new Logger();
    this.request = request;
};

util.inherits(Scope, EventEmitter);

Scope.prototype.logger = function () {
    return this.logger;
};

Scope.prototype.request = function () {
	return this.request;
};

exports.Scope = Scope;