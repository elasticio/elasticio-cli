const { EventEmitter } = require('events');
const { Logger } = require('./logger.js');
const helpers = require('./helpers.js');
const { print, INFO, ERROR, DATA } = require('./theme.js');

exports.Scope = class Scope extends EventEmitter {
  constructor() {
    super(EventEmitter);
    EventEmitter.call(this);
    this.logger = new Logger();

    const onError = (err) => {
      print(err.stack, ERROR);
    };

    const onData = (newMsg) => {
      print('Component returned following message:', INFO);
      print(helpers.formatObject(newMsg), DATA);
    };

    const onSnapshot = (newSnapshot) => {
      print('Component returned following snapshot:', INFO);
      print(helpers.formatObject(newSnapshot), DATA);
    };

    const onEnd = () => {
      print('Component execution done', INFO);
      helpers.destroyProcess();
    };

    this
      .on('error', onError)
      .on('data', onData)
      .on('snapshot', onSnapshot)
      .on('end', onEnd);
  }
};
