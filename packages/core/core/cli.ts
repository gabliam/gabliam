#!/usr/bin/env node
import 'reflect-metadata';
import yargs from 'yargs';
import { StartCommand } from './src/commands/start-command';

yargs
  .usage('Usage $0 <command> [options]')
  .command(new StartCommand())
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
