var util = require('util');

var Logger = function () {
    "use strict";
};

Logger.prototype.info = function (message, args) {
    log(message, args);
};

Logger.prototype.debug = function (message, args) {
    log(message, args);
};

var log = function(message, args){
    var text = args ? util.format(message, args) : message;

    console.log(text);
};

exports.Logger = Logger;