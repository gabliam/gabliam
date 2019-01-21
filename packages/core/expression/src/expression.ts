import { Expression as AstExpression } from 'estree';
import { Parser, IS_STRING } from './parser';
import * as _ from 'lodash';

export class Expression {
  private parser: Parser;

  constructor(
    ast: AstExpression,
    private context: object = {},
    private input: string
  ) {
    this.parser = new Parser(ast);
  }

  getValue<T>(vars: object = {}): T | undefined | null {
    const context = Object.keys(vars).reduce(
      (prev, current) => {
        (<any>prev)[`$${current}`] = _.cloneDeep((<any>vars)[current]);
        return prev;
      },
      {
        $root: this.context,
      }
    );

    const res = this.parser.parse({
      ...this.context,
      ...context,
    });

    if (res === IS_STRING) {
      return <any>this.input;
    }
    return res;
  }
}
