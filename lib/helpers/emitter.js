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

class EmitterError extends Error { }
exports.EmitterError = EmitterError;

exports.Emitter = class Emitter extends EventEmitter {
  constructor() {
    super(EventEmitter);
    EventEmitter.call(this);
    this.logger = new Logger();
    this.VALID_EVENTS = new Set(['data', 'error', 'snapshot', 'rebound', 'updateSnapshot', 'updateKeys', 'httpReply', 'end']);
    this.EMIT_SIZE_LIMIT = 3500000;

    const onData = (data) => {
      print.info('Component emitted data:');
      print.data(utils.formatObject(data));
    };

    const onSnapshot = (snapshot) => {
      print.info('Component emitted snapshot:');
      print.data(utils.formatObject(snapshot));
    };

    const onRebound = (rebound) => {
      print.info('Component emitted rebound:');
      print.data(utils.formatObject(rebound));
    };

    const onUpdateSnapshot = (updateSnapshot) => {
      print.info('Component emitted updateSnapshot:');
      print.data(utils.formatObject(updateSnapshot));
    };

    const onUpdateKeys = (updateKeys) => {
      print.info('Component emitted updateKeys:');
      print.data(utils.formatObject(updateKeys));
    };

    const onHttpReply = (httpReply) => {
      print.info('Component emitted httpReply:');
      print.data(utils.formatObject(httpReply));
    };

    const onEnd = () => {
      print.info('Component emitted end');
      utils.destroyProcess();
    };

    this
      .on('data', onData)
      .on('snapshot', onSnapshot)
      .on('rebound', onRebound)
      .on('updateSnapshot', onUpdateSnapshot)
      .on('updateKeys', onUpdateKeys)
      .on('httpReply', onHttpReply)
      .on('end', onEnd);
  }

  /**
   * Filters the emitted events before passing to EventEmitter
   * @param {string} eventName - event type emitted, must be one of VALID_EVENTS
   */
  async emit(eventName, ...args) {
    if (eventName === 'error') {
      print.info('Component emitted error:');
      print.error(args[0] ? (args[0].stack || args[0]) : '');
      throw new EmitterError(args[0] ? (args[0].stack || args[0]) : '');
    }
    if (!this.VALID_EVENTS.has(eventName)) throw new EmitterError(`The event type ${eventName} is not recognized`);

    args.forEach((arg) => {
      if (arg !== undefined && arg !== null && arg.constructor === Object) {
        try {
          JSON.stringify(arg);
        } catch (e) {
          throw new EmitterError(e.message);
        }
      }
      if (Emitter.jsonSize(arg) > this.EMIT_SIZE_LIMIT) throw new EmitterError('The emitted JSON cannot be greater than 3.5 MB');
    });

    super.emit(eventName, ...args);
  }

  /**
   * Calculates the size of a JSON in bytes
   * @param {Object} json - the JSON to calculate the size of
   * @returns {number} size - size of the JSON in bytes
   */
  static jsonSize(json) {
    // eslint-disable-next-line no-bitwise
    return ~-encodeURI((JSON.stringify(json))).split(/%..|./).length;
  }
};
