/* eslint-disable no-console */
const { EventEmitter } = require('events');
const util = require('util');
const utils = require('./utils.js');
const { print } = require('./log.js');

function log(type, message, args) {
  const text = args ? util.format(message, args) : message;
  console.log(`${type}${text}`);
}

class Logger {
  constructor() {
    this.info = (msg, args) => { log('Info: ', msg, args); };
    this.debug = (msg, args) => { log('Debug: ', msg, args); };
    this.warn = (msg, args) => { log('Warn: ', msg, args); };
    this.error = (msg, args) => { log('Error: ', msg, args); };
    this.fatal = (msg, args) => { log('Fatal: ', msg, args); };
    this.trace = (msg, args) => { log('Trace: ', msg, args); };
  }
}

exports.Emitter = class Emitter extends EventEmitter {
  constructor() {
    super(EventEmitter);
    EventEmitter.call(this);
    this.logger = new Logger();

    const onError = (err) => {
      print.info('Component emitted error:');
      print.error(err.stack);
    };

    const onData = (newMsg) => {
      print.info('Component emitted data:');
      print.data(utils.formatObject(newMsg));
    };

    const onSnapshot = (newSnapshot) => {
      print.info('Component emitted snapshot:');
      print.data(utils.formatObject(newSnapshot));
    };

    const onEnd = () => {
      print.info('Component emitted end');
      utils.destroyProcess();
    };

    this
      .on('error', onError)
      .on('data', onData)
      .on('snapshot', onSnapshot)
      .on('end', onEnd);
  }
};
