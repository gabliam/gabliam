import * as esprima from 'esprima';
import { ExpressionStatement } from 'estree';
import { Expression } from './expression';

export class ExpressionParser {
  constructor(private context: object = {}) {
  }

  parseExpression(input: string) {
    const program = esprima.parseScript(input);
    const ast = (<ExpressionStatement>program.body[0]).expression;
    return new Expression(ast, this.context);
  }
}
