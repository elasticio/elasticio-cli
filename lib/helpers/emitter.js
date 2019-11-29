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

  /**
   * Filters the emitted events before passing to EventEmitter
   * @param {string} eventName - event type emitted, must be one of VALID_EVENTS
   */
  async emit(eventName, ...args) {
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
