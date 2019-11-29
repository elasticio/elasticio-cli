exports.process = async function process(msg, cfg, snapshot) {
  const a = {};
  const b = {};
  a.b = b;
  b.a = a;
  await this.emit('data', a);
};
