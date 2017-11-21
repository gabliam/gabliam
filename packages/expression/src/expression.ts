import { Expression as AstExpression } from 'estree';
import { Parser } from './parser';

export class Expression {
  private parser: Parser;

  constructor(ast: AstExpression, private context: object = {}) {
    this.parser = new Parser(ast);
  }

  getValue<T>(vars: object = {}): T | undefined | null {
    return this.parser.parse({
      ...this.context,
      ...vars
    });
  }
}
