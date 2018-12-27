import 'reflect-metadata';
import {
  makeParamDecorator,
  TypeDecorator,
  makePropDecorator,
} from './decorator/util';
import { Reflection } from './reflection/reflection';

export interface ParamDecorator {
  (obj?: Param): TypeDecorator;

  new (obj?: Param): Param;
}

export interface Param {
  name?: string;
}

export const Context: ParamDecorator = makeParamDecorator(
  'Context',
  (p: Param = {}) => ({ ...p })
);

export interface LolDecorator {
  (): any;

  new (): any;
}

export const Lol: LolDecorator = makePropDecorator('Lol');

// class TestLol {
//   @Lol()
//   lolilol() {

//   }
// }

class Test /* extends TestLol */ {
  @Lol()
  lol() {}
  test(@Context({ name: 'lol' }) lol: string, @Context() context: string) {}

  test2(
    @Context() lol: string,
    @Context({ name: 'context' }) context: string
  ) {}
}

const reflection = new Reflection();

console.log('reflection test', reflection.parameters(Test, 'test'));

console.log('reflexion props', reflection.propMetadata(Test));
// console.log(require('util').inspect((t as any)[PARAMETERS][0][0]), {depth: null});
