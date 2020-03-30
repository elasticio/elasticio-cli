exports.startup = function startup(cfg) {
  console.debug('startup');
};

exports.init = function init(cfg) {
  console.debug('init');
};

exports.process = function process(msg, cfg, snapshot) {
  console.debug('process');
};

exports.shutdown = function shutdown(cfg, startupData) {
  console.debug('shutdown');
};
