const util = require('util');

function log(type, message, args) {
  const text = args ? util.format(message, args) : message;
  console.log(`${type}${text}`);
}

exports.Logger = class Logger {
  constructor() {
    this.info = (msg, args) => { log('Info: ', msg, args); };
    this.debug = (msg, args) => { log('Debug: ', msg, args); };
    this.warn = (msg, args) => { log('Warn: ', msg, args); };
    this.error = (msg, args) => { log('Error: ', msg, args); };
    this.fatal = (msg, args) => { log('Fatal: ', msg, args); };
    this.trace = (msg, args) => { log('Trace: ', msg, args); };
  }
};
