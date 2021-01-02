const chalk = require('chalk');

function printErrorAndExit(message) {
  printError(message);
  exitOnError();
}

module.exports = { printErrorAndExit };

function printError(message = 'An unknown error occured.') {
  console.log(chalk.red(message));
}
function exitOnError() {
  process.exit();
}
