const util = require('util');
const _ = require('underscore');
const fs = require('fs');

const COMMANDS = {
  'cmp:process': {
    main: './process.js',
    options: true,
  },
  'cmp:exec': {
    main: './exec.js',
    options: true,
  },
  oauth2: {
    main: './oauth2/index.js',
    options: true,
  },
};

const NEW_LINE = '\n';

const print = (value) => {
  process.stdout.write(`${value}\n`);
};

const printAndExit = (value) => {
  print(value);

  process.exit();
};

const printHelp = () => {
  printAndExit(helpInfo());
};

const helpInfo = () => {
  const commandNames = _.keys(COMMANDS);

  const { version } = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`, 'utf8'));

  const help = `${NEW_LINE}  elastic.io tools ${version}${NEW_LINE}${NEW_LINE}  Options:${NEW_LINE}${NEW_LINE}`;

  const options = commandNames.map((name) => {
    let result = name;
    const componentInfo = COMMANDS[name];

    if (componentInfo.options) {
      result += ' <options>';
    }

    return result;
  });

  return help + options.join(NEW_LINE);
};

const args = process.argv;

if (args.length < 3) {
  printHelp();
}


const command = args[2];

const commandInfo = COMMANDS[command];

if (!commandInfo) {
  printAndExit(util.format('%s is unknown command', command));
}

require(commandInfo.main);
