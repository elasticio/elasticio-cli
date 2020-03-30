exports.verify = async function verify(cfg, cb) {
  if (cfg.key === 'secret') return cb(null, { verified: true });
  this.emit('error', 'Emitting failure error');
  throw new Error('Verification failed');
};
