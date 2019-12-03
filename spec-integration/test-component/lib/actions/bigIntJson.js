exports.process = async function process(msg, cfg, snapshot) {
  await this.emit('data', {
    bigInt: BigInt(123456789),
  });
};
