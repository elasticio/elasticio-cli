exports.process = async function process(msg, cfg, snapshot) {
  await this.emit('data', ['I\'m an array']);
};
