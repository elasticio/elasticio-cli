exports.process = async function process(msg, cfg, snapshot) {
  await this.emit('data', {
    prop1: 'foobar1',
  });
  await this.emit('snapshot', {
    timestamp1: 123,
  });
  await this.emit('data', {
    prop2: 'foobar2',
  });
  await this.emit('end');
};
