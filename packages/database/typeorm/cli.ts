#!/usr/bin/env node
import 'reflect-metadata';
import yargs from 'yargs';
import { CacheClearCommand } from './src/commands/CacheClearCommand';
import { EntityCreateCommand } from './src/commands/EntityCreateCommand';
import { MigrationCreateCommand } from './src/commands/MigrationCreateCommand';
import { MigrationGenerateCommand } from './src/commands/MigrationGenerateCommand';
import { MigrationRevertCommand } from './src/commands/MigrationRevertCommand';
import { MigrationRunCommand } from './src/commands/MigrationRunCommand';
import { MigrationShowCommand } from './src/commands/MigrationShowCommand';
import { QueryCommand } from './src/commands/QueryCommand';
import { SchemaDropCommand } from './src/commands/SchemaDropCommand';
import { SchemaLogCommand } from './src/commands/SchemaLogCommand';
import { SchemaSyncCommand } from './src/commands/SchemaSyncCommand';
import { SubscriberCreateCommand } from './src/commands/SubscriberCreateCommand';
import { VersionCommand } from './src/commands/VersionCommand';

// tslint:disable-next-line:no-unused-expression
yargs
  .usage('Usage: $0 <command> [options]')
  .command(new SchemaSyncCommand())
  .command(new SchemaLogCommand())
  .command(new SchemaDropCommand())
  .command(new QueryCommand())
  .command(new EntityCreateCommand())
  .command(new SubscriberCreateCommand())
  .command(new MigrationCreateCommand())
  .command(new MigrationGenerateCommand())
  .command(new MigrationRunCommand())
  .command(new MigrationShowCommand())
  .command(new MigrationRevertCommand())
  .command(new VersionCommand())
  .command(new CacheClearCommand())
  .recommendCommands()
  .demandCommand(1)
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help').argv;

require('yargonaut')
  .style('blue')
  .style('yellow', 'required')
  .helpStyle('green')
  .errorsStyle('red');
