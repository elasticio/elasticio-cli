const gv = [];

exports.startup = function startup(cfg) {
  gv.push('Startup modified global variable');
};

exports.init = function init(cfg) {
  gv.push('Init modified global variable');
};

exports.process = async function process(msg, cfg, snapshot) {
  await this.emit('data', {
    gv,
  });
};
