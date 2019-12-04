exports.process = async function process(msg, cfg, snapshot) {
  const emitters = [];
  emitters.push(this.emit('data', {
    label: 1,
  }));
  emitters.push(this.emit('data', {
    label: 2,
  }));
  await Promise.all(emitters);
};
