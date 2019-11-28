exports.process = async function process(msg, cfg, snapshot) {
  await this.emit('data', {
    prop: 'foobar',
  });
  return {
    data: 'foobar2',
  };
};
