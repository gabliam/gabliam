import { Application } from '../../../../../src';
import TypeormPlugin from '@gabliam/typeorm';

@Application({
  name: 'MyApp',
  config: './config',
  scanPath: './',
  plugins: [TypeormPlugin],
})
export class App {}
