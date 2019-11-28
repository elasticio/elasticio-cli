exports.process = async function process(msg, cfg, snapshot) {
  await this.emit('data', 'I\'m a string');
};
