exports.process = async function process(msg, cfg, snapshot) {
  await this.emit('error', 'First');
  await this.emit('error', 'Second');
};
