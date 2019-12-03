module.exports = {
  env: {
    mocha: true,
    es6: true,
    node: true,
  },
  extends: 'airbnb-base',
  globals: {
    'BigInt': true,
  },
  rules: {
    'linebreak-style': 'off',
    "max-classes-per-file": ["error", 3],
  },
};
