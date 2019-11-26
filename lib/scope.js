const { EventEmitter } = require('events');
const { Logger } = require('./logger.js');

exports.Scope = class Scope extends EventEmitter {
  constructor() {
    super(EventEmitter);
    EventEmitter.call(this);
    this.logger = new Logger();
  }
};
