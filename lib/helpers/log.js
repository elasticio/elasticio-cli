/* eslint-disable no-console */
const chalk = require('chalk');

exports.print = {
  info: (msg) => { console.log(chalk.green.bold(msg)); },
  error: (msg) => { console.log(chalk.red.bold(msg)); },
  data: (msg) => { console.log(chalk.magenta.bold(msg)); },
  warn: (msg) => { console.log(chalk.yellow.bold(msg)); },
};
