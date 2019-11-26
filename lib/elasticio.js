const util = require('util');
const _ = require('underscore');
const fs = require('fs');
const { runProcess } = require('./process');
const { runExec } = require('./exec');

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

program
  .version(version);

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

program
  .command('cmp:exec', 'Run any exposed function from a file')
  .argument('<path>', 'Path to file with functions')
  .argument('[func]', 'Function name to run')
  .argument('[fixture]', 'Fixture to run against')
  .action(async (path, func, fixture) => {
    await runExec(path, func, fixture);
  });

program.parse(process.argv);
