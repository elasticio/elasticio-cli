/* eslint-disable no-console */
const chalk = require('chalk');

exports.print = function print(msg, level) {
  if (level === 'info') console.log(chalk.green(msg));
  else if (level === 'warn') console.log(chalk.yellow(msg));
  else if (level === 'error') console.log(chalk.red(msg));
  else if (level === 'data') console.log(chalk.magenta(msg));
  else console.log(msg);
}

exports.ERROR = 'error';
exports.INFO = 'info';
exports.WARN = 'warn';
exports.DATA = 'data';
