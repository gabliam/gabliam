import 'reflect-metadata';
import { makePropDecorator } from './decorator/util';
import { Reflection } from './reflection/reflection';
import { interfaces } from 'inversify';

export interface BeanDecorator {
  (id: interfaces.ServiceIdentifier<any>): any;

  new (id: interfaces.ServiceIdentifier<any>): any;
}

// tslint:disable-next-line:no-empty-interface
export interface Bean {
  id: interfaces.ServiceIdentifier<any>;
}

export const Bean: BeanDecorator = makePropDecorator(
  'Bean',
  (id: interfaces.ServiceIdentifier<any>) => ({ id })
);

export interface LolDecorator {
  (): any;

  new (): any;
}

export const Lol: LolDecorator = makePropDecorator('Lol');

class Test /* extends TestLol */ {
  @Bean('lol2')
  @Bean('lol')
  @Lol()
  lol() {}
}

const reflection = new Reflection();

console.log('reflection test', reflection.parameters(Test, 'lol'));

console.log('reflexion props', reflection.propMetadata(Test));

console.log(
  'reflexion getPropsOfMetadata by name',
  reflection.getPropsOfMetadata(Test, 'Bean')
);

console.log(
  'reflexion getPropsOfMetadata by deco',
  reflection.getPropsOfMetadata(Test, Bean)
);
// console.log(require('util').inspect((t as any)[PARAMETERS][0][0]), {depth: null});
