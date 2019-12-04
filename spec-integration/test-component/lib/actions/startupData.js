exports.startup = function startup(cfg) {
  return {
    data: 'STARTUP_HOOK',
  };
};

exports.process = function process(msg, cfg, snapshot) {};

exports.shutdown = function shutdown(cfg, startupData) {
  console.debug(startupData);
};
