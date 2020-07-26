import { Expression as AstExpression } from 'estree';
import { Parser, IS_STRING } from './parser';
import _ from 'lodash';
const validPath = require('is-valid-path');

export class Expression {
  private parser: Parser | undefined;

  constructor(
    ast: AstExpression | null,
    private context: object = {},
    private input: string
  ) {
    if (ast) {
      this.parser = new Parser(ast);
    }
  }

  getValue<T>(vars: object = {}): T | undefined | null {
    if (!this.parser) {
      if (validPath(this.input)) {
        return <any>this.input;
      }
      return undefined;
    }

    const context = Object.keys(vars).reduce(
      (prev, current) => {
        (<any>prev)[`$${current}`] = _.cloneDeep((<any>vars)[current]);
        return prev;
      },
      {
        $root: this.context,
      }
    );

    try {
      const res = this.parser.parse({
        ...this.context,
        ...context,
      });

      if (res === null && validPath(this.input)) {
        return <any>this.input;
      }

      if (res === IS_STRING) {
        return <any>this.input;
      }

      return res;
    } catch (e) {
      // case of multiple subpath
      if (validPath(this.input)) {
        return <any>this.input;
      }
      throw e;
    }
  }
}
