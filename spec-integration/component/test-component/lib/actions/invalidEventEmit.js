exports.process = async function process(msg, cfg, snapshot) {
  await this.emit('invalidEventName', {
    prop: 'foobar',
  });
};
