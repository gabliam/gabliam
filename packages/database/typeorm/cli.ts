#!/usr/bin/env node
import 'reflect-metadata';
import * as yargs from 'yargs';
import { CacheClearCommand } from './src/commands/CacheClearCommand';

// tslint:disable-next-line:no-unused-expression
yargs
  .usage('Usage: $0 <command> [options]')
  .command(new CacheClearCommand())
  .recommendCommands()
  .demandCommand(1)
  .strict()
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help').argv;

require('yargonaut')
  .style('blue')
  .style('yellow', 'required')
  .helpStyle('green')
  .errorsStyle('red');
