/* eslint-disable no-console */
const chalk = require('chalk');

exports.print = {
  info: (msg) => { console.log(chalk.green(msg)); },
  error: (msg) => { console.log(chalk.red(msg)); },
  data: (msg) => { console.log(chalk.magenta(msg)); },
  warn: (msg) => { console.log(chalk.yellow(msg)); },
};
