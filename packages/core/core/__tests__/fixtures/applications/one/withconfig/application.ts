import TypeormPlugin from '@gabliam/typeorm';
import { Application } from '../../../../../src';

@Application({
  name: 'MyApp',
  config: './config',
  scanPath: './',
  plugins: [TypeormPlugin],
})
export class App {}
