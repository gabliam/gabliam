#!/usr/bin/env node
import 'reflect-metadata';
import yargs from 'yargs';
import { StartCommand } from './src/commands/start-command';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs
  .usage('Usage $0 <command> [options]')
  .command(new StartCommand())
  .recommendCommands()
  .demandCommand(1)
  .strict()
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help').argv;

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('yargonaut')
  .style('blue')
  .style('yellow', 'required')
  .helpStyle('green')
  .errorsStyle('red');
