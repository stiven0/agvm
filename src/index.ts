#! /usr/bin/env node

import { program } from 'commander';
import figlet from 'figlet';

import { doctorCommand } from './commands/doctor';
import { installCommand } from './commands/install';
import { listCommand } from './commands/list';
import { uninstallCommand } from './commands/uninstall';
import { useCommand } from './commands/use';
import { withErrorHandler } from './errors/handle-error';

console.log(figlet.textSync('AGVM'));

program
  .version('1.0.0')
  .command('install <version>')
  .description('Install a specific version of Angular CLI')
  .action((version) => withErrorHandler(() => installCommand(version)));

program
  .command('list')
  .description('List installed versions of Angular CLI')
  .action(() => withErrorHandler(() => listCommand()));

program
  .command('use <version>')
  .description('Use an available version of Angular CLI')
  .action((version: string) => withErrorHandler(() => useCommand(version)));

program
  .command('uninstall <version>')
  .description('Uninstall a version of Angular CLI')
  .action((version: string) => withErrorHandler(() => uninstallCommand(version)));

program
  .command('doctor')
  .description('Check for problems')
  .action(() => withErrorHandler(() => doctorCommand()));

program.parse(process.argv);
