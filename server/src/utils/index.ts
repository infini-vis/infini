const chalk = require('chalk');

export function Logger(...args: any[]) {
  if (process.env.NODE_ENV === 'test') {
    return '';
  }
  const now = new Date();
  return console.log.apply(console, [
    chalk.hex('#00ca64')(`${now.toLocaleString()}.${now.getMilliseconds()}: `),
    ...args,
  ]);
}
