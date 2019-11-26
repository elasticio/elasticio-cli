const { EventEmitter } = require('events');
const { Logger } = require('./logger.js');
const helpers = require('./helpers.js');
const { print } = require('./theme.js');

exports.Scope = class Scope extends EventEmitter {
  constructor() {
    super(EventEmitter);
    EventEmitter.call(this);
    this.logger = new Logger();

    const onError = (err) => {
      print.error(err.stack);
    };

    const onData = (newMsg) => {
      print.info('Component returned following message:');
      print.data(helpers.formatObject(newMsg));
    };

    const onSnapshot = (newSnapshot) => {
      print.info('Component returned following snapshot:');
      print.data(helpers.formatObject(newSnapshot));
    };

    const onEnd = () => {
      print.info('Component execution done');
      helpers.destroyProcess();
    };

    this
      .on('error', onError)
      .on('data', onData)
      .on('snapshot', onSnapshot)
      .on('end', onEnd);
  }
};
