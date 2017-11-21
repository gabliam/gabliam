// tslint:disable:no-bitwise
import { generate } from 'escodegen';
import {
  Expression,
  UnaryExpression,
  ArrayExpression,
  SpreadElement,
  ObjectExpression,
  Pattern,
  BinaryExpression,
  LogicalExpression,
  Identifier,
  ThisExpression,
  CallExpression,
  Super,
  MemberExpression,
  ConditionalExpression,
  ExpressionStatement,
  ReturnStatement,
  FunctionExpression,
  TemplateLiteral,
  TaggedTemplateExpression,
  TemplateElement,
  Statement
} from 'estree';
import { Symbol } from 'bson';

const FAIL = new Symbol('FAIL');

export class Parser {
  constructor(private ast: Expression) {}

  parse<T = any>(vars: object = {}): T | undefined | null {
    const result = this.walk(this.ast, vars);
    return result === FAIL ? undefined : result;
  }

  private parseUnary(node: UnaryExpression, vars: object) {
    const val = this.walk(node.argument, vars);
    switch (node.operator) {
      case '+':
        return +val;
      case '-':
        return -val;
      case '~':
        return ~val;
      case '!':
        return !val;
      case 'typeof':
        return typeof val;
      case 'void':
      case 'delete':
        return undefined;
      default:
        return FAIL;
    }
  }

  private parseArray(node: ArrayExpression, vars: object) {
    const xs: any[] = [];
    for (const nodeElement of node.elements) {
      const x = this.walk(nodeElement, vars);
      if (x === FAIL) {
        return FAIL;
      }
      xs.push(x);
    }
    return xs;
  }

  private parseObject(node: ObjectExpression, vars: object) {
    const obj = {};
    for (let i = 0; i < node.properties.length; i++) {
      const prop = node.properties[i];
      const value: any =
        prop.value === null ? prop.value : this.walk(prop.value, vars);
      if (value === FAIL) {
        return FAIL;
      }
      const key: any = prop.key === null ? prop.key : this.walk(prop.key, vars);
      if (key === FAIL) {
        return FAIL;
      }
      (<any>obj)[key] = value;
    }
    return obj;
  }

  private parseLeftRight(
    node: BinaryExpression | LogicalExpression,
    vars: object
  ) {
    const l = this.walk(node.left, vars);
    if (l === FAIL) {
      return [FAIL];
    }
    const r = this.walk(node.right, vars);
    if (r === FAIL) {
      return [FAIL];
    }
    return [l, r];
  }

  private parseBinary(node: BinaryExpression, vars: object) {
    const [l, r] = this.parseLeftRight(node, vars);
    if (l === FAIL) {
      return FAIL;
    }
    switch (node.operator) {
      case '==':
        // tslint:disable-next-line:triple-equals
        return l == r;

      case '!=':
        // tslint:disable-next-line:triple-equals
        return l != r;

      case '===':
        return l === r;

      case '!==':
        return l !== r;

      case '<':
        return l < r;

      case '<=':
        return l <= r;

      case '>':
        return l > r;

      case '>=':
        return l >= r;

      case '<<':
        return l << r;

      case '>>':
        return l >> r;

      case '>>>':
        return l >>> r;

      case '+':
        return l + r;

      case '-':
        return l - r;

      case '*':
        return l * r;

      case '/':
        return l / r;

      case '%':
        return l % r;

      case '**':
        return l ** r;

      case '|':
        return l | r;

      case '^':
        return l ^ r;

      case '&':
        return l & r;

      case 'in':
        return l in r;

      case 'instanceof':
        return l instanceof r;
    }
  }

  private parseLogical(node: LogicalExpression, vars: object) {
    const [l, r] = this.parseLeftRight(node, vars);
    if (l === FAIL) {
      return FAIL;
    }
    switch (node.operator) {
      case '||':
        return l || r;
      case '&&':
        return l && r;
    }
  }

  private parseIdentifier(node: Identifier, vars: object) {
    if ({}.hasOwnProperty.call(vars, node.name)) {
      return (<any>vars)[node.name];
    }
    return undefined;
  }

  private parseThis(node: ThisExpression, vars: object) {
    if ({}.hasOwnProperty.call(vars, 'this')) {
      return (<any>vars)['this'];
    }
    return FAIL;
  }

  private parseCall(node: CallExpression, vars: object) {
    const callee = this.walk(node.callee, vars);
    if (callee === FAIL) {
      return FAIL;
    }
    if (typeof callee !== 'function') {
      return FAIL;
    }

    let ctx = (<any>node.callee).object
      ? this.walk((<any>node.callee).object, vars)
      : FAIL;
    if (ctx === FAIL) {
      ctx = null;
    }

    const args = [];
    for (const arg of node.arguments) {
      const x = this.walk(arg, vars);
      if (x === FAIL) {
        return FAIL;
      }
      args.push(x);
    }
    return callee.apply(ctx, args);
  }

  private parseMember(node: MemberExpression, vars: object) {
    const obj = this.walk(node.object, vars);
    if (obj === undefined) {
      return undefined;
    }

    // do not allow access to methods on Function
    if (obj === FAIL || typeof obj === 'function') {
      return FAIL;
    }
    if (node.property.type === 'Identifier') {
      return obj[node.property.name];
    }
    const prop = this.walk(node.property, vars);
    if (prop === FAIL) {
      return FAIL;
    }
    return obj[prop];
  }

  private parseConditional(node: ConditionalExpression, vars: object) {
    const val = this.walk(node.test, vars);
    if (val === FAIL) {
      return FAIL;
    }
    return val
      ? this.walk(node.consequent, vars)
      : this.walk(node.alternate, vars);
  }

  private parseStatement(node: ExpressionStatement, vars: object) {
    const val = this.walk(node.expression, vars);
    if (val === FAIL) {
      return FAIL;
    }
    return val;
  }

  private parseReturnStatement(node: ReturnStatement, vars: object) {
    return this.walk(node.argument, vars);
  }

  private parseFunction(node: FunctionExpression, vars: object) {
    const bodies = node.body.body;

    const newVars = {
      ...vars
    };

    node.params.forEach(key => {
      if (key.type === 'Identifier') {
        (<any>newVars)[key.name] = null;
      }
    });

    for (const i in bodies) {
      if (this.walk(bodies[i], newVars) === FAIL) {
        return FAIL;
      }
    }

    const keys = Object.keys(vars);
    const vals = keys.map(key => {
      return (<any>vars)[key];
    });
    return Function(keys.join(', '), 'return ' + generate(node)).apply(
      null,
      vals
    );
  }

  private parseTemplateLiteral(node: TemplateLiteral, vars: object) {
    let str = '';
    let i: number;
    for (i = 0; i < node.expressions.length; i++) {
      str += this.walk(node.quasis[i], vars);
      str += this.walk(node.expressions[i], vars);
    }
    str += this.walk(node.quasis[i], vars);
    return str;
  }

  private parseTaggedTemplate(node: TaggedTemplateExpression, vars: object) {
    const tag = this.walk(node.tag, vars);
    const quasi = node.quasi;
    const strings = quasi.quasis.map(q => this.walk(q, vars));
    const values = quasi.expressions.map(e => this.walk(e, vars));
    return tag.apply(null, [strings].concat(values));
  }

  private walk(
    node:
      | Expression
      | SpreadElement
      | Pattern
      | Super
      | TemplateElement
      | Statement
      | null
      | undefined,
    vars: object
  ): any {
    if (!node) {
      return FAIL;
    }
    switch (node.type) {
      case 'Literal':
        return node.value;
      case 'UnaryExpression':
        return this.parseUnary(node, vars);
      case 'ArrayExpression':
        return this.parseArray(node, vars);
      case 'ObjectExpression':
        return this.parseObject(node, vars);
      case 'BinaryExpression':
        return this.parseBinary(node, vars);
      case 'LogicalExpression':
        return this.parseLogical(node, vars);
      case 'Identifier':
        return this.parseIdentifier(node, vars);
      case 'ThisExpression':
        return this.parseThis(node, vars);
      case 'CallExpression':
        return this.parseCall(node, vars);
      case 'MemberExpression':
        return this.parseMember(node, vars);
      case 'ConditionalExpression':
        return this.parseConditional(node, vars);
      case 'ExpressionStatement':
        return this.parseStatement(node, vars);
      case 'ReturnStatement':
        return this.parseReturnStatement(node, vars);
      case 'FunctionExpression':
        return this.parseFunction(node, vars);
      case 'TemplateLiteral':
        return this.parseTemplateLiteral(node, vars);
      case 'TaggedTemplateExpression':
        return this.parseTaggedTemplate(node, vars);
      case 'TemplateElement':
        return node.value.cooked;
      default:
        return FAIL;
    }
  }
}
