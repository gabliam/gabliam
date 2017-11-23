import { ExpressionParser } from '../src';

describe('expression evaluator', () => {
  describe('compile', () => {
    test('should compile an expression an return an evaluator', () => {
      const compiledExpression = ExpressionParser.eval('1234');
      expect(compiledExpression).toMatchSnapshot();
    });
  });

  describe('parse', () => {
    describe('primitives', () => {
      test('should evaluate a number', () => {
        const numberInt = ExpressionParser.eval('123');
        const numberFloat = ExpressionParser.eval('123.4');

        expect(numberInt).toMatchSnapshot();
        expect(typeof numberInt).toMatchSnapshot();
        expect(numberFloat).toMatchSnapshot();
        expect(typeof numberFloat).toMatchSnapshot();
      });

      test('should evaluate a string', () => {
        // tslint:disable-next-line:quotemark
        const stringSingle = ExpressionParser.eval("'hello world!'");
        const stringDouble = ExpressionParser.eval('"hello world!"');

        expect(stringSingle).toMatchSnapshot();
        expect(typeof stringSingle).toMatchSnapshot();
        expect(stringDouble).toMatchSnapshot();
        expect(typeof stringSingle).toMatchSnapshot();
      });

      test('should evaluate a string with embedded escaped single quotes', () => {
        // tslint:disable-next-line:quotemark
        const stringSingle = ExpressionParser.eval("'hello world !'");

        const stringDouble = ExpressionParser.eval('"hello world !"');

        expect(stringSingle).toMatchSnapshot();
        expect(typeof stringSingle).toMatchSnapshot();
        expect(stringDouble).toMatchSnapshot();
        expect(typeof stringDouble).toMatchSnapshot();
      });

      test('should evaluate a string with embedded escaped double quotes', () => {
        // tslint:disable-next-line:quotemark
        const stringSingle = ExpressionParser.eval("'hello world!'");
        const stringDouble = ExpressionParser.eval('"hello world!"');

        expect(stringSingle).toMatchSnapshot();
        expect(typeof stringSingle).toMatchSnapshot();
        expect(stringDouble).toMatchSnapshot();
        expect(typeof stringDouble).toMatchSnapshot();
      });

      test('should evaluate a boolean', () => {
        const boolTrue = ExpressionParser.eval('true');
        const boolFalse = ExpressionParser.eval('false');
        expect(boolTrue).toMatchSnapshot();
        expect(typeof boolTrue).toMatchSnapshot();
        expect(boolFalse).toMatchSnapshot();
        expect(typeof boolFalse).toMatchSnapshot();
      });
    });
  });

  describe('lookups', () => {
    let expressionParser: ExpressionParser;

    beforeAll(() => {
      expressionParser = new ExpressionParser({
        iAmANumber: 1,
        iAmANestedPropertyName: 'propLookup',
        nested: {
          iAmAString: 'hi',
          reallyNested: {
            iAmTrue: true,
            hi: 'bye'
          },
          propLookup: 'Found!'
        }
      });
    });

    test('should look up a primitive in the context', () => {
      const n = expressionParser.parseExpression('iAmANumber').getValue();
      expect(n).toMatchSnapshot();
      expect(typeof n).toMatchSnapshot();
    });

    test('should look up a nested primitive in the context using dot notation', () => {
      const s = expressionParser
        .parseExpression('nested.iAmAString')
        .getValue();

      expect(s).toMatchSnapshot();
      expect(typeof s).toMatchSnapshot();
    });

    test('should look up a doubly nested primitive in the context using dot notation', () => {
      const bool = expressionParser
        .parseExpression('nested.reallyNested.iAmTrue')
        .getValue();

      expect(bool).toMatchSnapshot();
      expect(typeof bool).toMatchSnapshot();
    });

    test('should look up a nested primitive in the context using bracket notation literal', () => {
      const s = expressionParser
        .parseExpression('nested["iAmAString"]')
        .getValue();
      expect(s).toMatchSnapshot();
      expect(typeof s).toMatchSnapshot();
    });

    test('should look up a nested primitive in the context using bracket notation', () => {
      const s = expressionParser
        .parseExpression('nested[iAmANestedPropertyName]')
        .getValue();
      expect(s).toMatchSnapshot();
      expect(typeof s).toMatchSnapshot();
    });

    test('should look up a really nested primitive in the context using bracket notation', () => {
      const s = expressionParser
        .parseExpression('nested.reallyNested[nested.iAmAString]')
        .getValue();
      expect(s).toMatchSnapshot();
      expect(typeof s).toMatchSnapshot();
    });

    test('should return undefined', () => {
      const s = expressionParser
        .parseExpression('nested.doestExist')
        .getValue();
      expect(s).toMatchSnapshot();
      expect(typeof s).toMatchSnapshot();
    });
  });

  describe('comparisons', () => {
    test('should evaluate an equality', () => {
      const comp1 = ExpressionParser.eval('1 == 1');
      const comp2 = ExpressionParser.eval('1 == 2');
      const comp3 = ExpressionParser.eval(`1 == '1'`);

      expect(comp1).toBe(true);
      expect(comp2).toBe(false);
      expect(comp3).toBe(true);
    });

    test('should evaluate an equality with lookups', () => {
      const context = {
        left: 1,
        right: 1
      };

      const comp = ExpressionParser.eval('$left == $right', context);

      expect(comp).toBe(true);
    });

    test('should evaluate an inequality (not equal)', () => {
      const comp1 = ExpressionParser.eval('1 != 2');
      const comp2 = ExpressionParser.eval('1 != 1');
      const comp3 = ExpressionParser.eval(`1 != '1'`);

      expect(comp1).toBe(true);
      expect(comp2).toBe(false);
      expect(comp3).toBe(false);
    });

    test('should evaluate an equality ===', () => {
      const comp1 = ExpressionParser.eval('1 === 1');
      const comp2 = ExpressionParser.eval('1 === 2');
      const comp3 = ExpressionParser.eval(`1 === '1'`);

      expect(comp1).toBe(true);
      expect(comp2).toBe(false);
      expect(comp3).toBe(false);
    });

    test('should evaluate an inequality (not equal) !==', () => {
      const comp1 = ExpressionParser.eval('1 !== 2');
      const comp2 = ExpressionParser.eval('1 !== 1');
      const comp3 = ExpressionParser.eval(`1 !== '1'`);

      expect(comp1).toBe(true);
      expect(comp2).toBe(false);
      expect(comp3).toBe(true);
    });

    test('should evaluate an inequality (greater than)', () => {
      const comp1 = ExpressionParser.eval('2 > 1');
      const comp2 = ExpressionParser.eval('1 > 1');

      expect(comp1).toBe(true);
      expect(comp2).toBe(false);
    });

    test('should evaluate an inequality (greater than or equal to)', () => {
      const comp1 = ExpressionParser.eval('1 >= 1');
      const comp2 = ExpressionParser.eval('2 >= 1');
      const comp3 = ExpressionParser.eval('1 >= 2');

      expect(comp1).toBe(true);
      expect(comp2).toBe(true);
      expect(comp3).toBe(false);
    });

    test('should evaluate an inequality (less than)', () => {
      const comp1 = ExpressionParser.eval('1 < 2');
      const comp2 = ExpressionParser.eval('1 < 1');

      expect(comp1).toBe(true);
      expect(comp2).toBe(false);
    });

    test('should evaluate an inequality (less than or equal to)', () => {
      const comp1 = ExpressionParser.eval('1 <= 2');
      const comp2 = ExpressionParser.eval('1 <= 2');
      const comp3 = ExpressionParser.eval('2 <= 1');

      expect(comp1).toBe(true);
      expect(comp2).toBe(true);
      expect(comp3).toBe(false);
    });

    test('should evaluate a complex inequality', () => {
      const comp = ExpressionParser.eval('"abc".length <= "abcde".length');

      expect(comp).toBe(true);
    });
  });

  describe('unary', () => {
    test('+', () => {
      expect(ExpressionParser.eval('+3')).toBe(3);
      expect(ExpressionParser.eval('+"3"')).toBe(3);
      expect(ExpressionParser.eval('+true')).toBe(1);
      expect(ExpressionParser.eval('+false')).toBe(0);
      expect(ExpressionParser.eval('+null')).toBe(0);
      expect(ExpressionParser.eval('+function(val){ return val; }')).toBeNaN();
    });

    test('+ with context', () => {
      const expression = new ExpressionParser({
        a: 3,
        b: '3',
        c: true,
        d: false,
        e: null,
        f: function(val: any) {
          return val;
        }
      });
      expect(expression.parseExpression('+a').getValue()).toBe(3);
      expect(expression.parseExpression('+b').getValue()).toBe(3);
      expect(expression.parseExpression('+c').getValue()).toBe(1);
      expect(expression.parseExpression('+d').getValue()).toBe(0);
      expect(expression.parseExpression('+e').getValue()).toBe(0);
      expect(expression.parseExpression('+f').getValue()).toBeNaN();
    });

    test('-', () => {
      expect(ExpressionParser.eval('-(3)')).toBe(-3);
      expect(ExpressionParser.eval('-(-3)')).toBe(3);
      expect(ExpressionParser.eval('-"4"')).toBe(-4);
    });

    test('- with context', () => {
      const expression = new ExpressionParser({
        a: 3,
        b: -3,
        c: '4'
      });
      expect(expression.parseExpression('-a').getValue()).toBe(-3);
      expect(expression.parseExpression('-b').getValue()).toBe(3);
      expect(expression.parseExpression('-c').getValue()).toBe(-4);
    });
  });

  describe('method invocation', () => {
    let expressionParser: ExpressionParser;
    beforeAll(() => {
      expressionParser = new ExpressionParser({
        funky: () => {
          return 'fresh';
        },
        argumentative: (arg: any) => {
          return arg;
        },
        name: 'ben'
      });
    });

    test('should look up and invoke a function', () => {
      const ret = expressionParser.parseExpression('funky()').getValue();

      expect(ret).toBe('fresh');
    });

    test('should look up and invoke a function with arguments', () => {
      const ret = expressionParser
        .parseExpression('argumentative("i disagree!")')
        .getValue();

      expect(ret).toBe('i disagree!');
    });

    test('should use a property if getter not available', () => {
      const ret = expressionParser.parseExpression('name').getValue();

      expect(ret).toBe('ben');
    });
  });

  describe('locals', () => {
    it('should refer to a local variable', () => {
      const local = new ExpressionParser({
        myString: 'global context'
      })
        .parseExpression('$myString == "hello world!"')
        .getValue({
          myString: 'hello world!'
        });

      expect(local).toBe(true);
    });

    it('should refer to the root context', () => {
      const local = new ExpressionParser({
        myString: 'global context'
      })
        .parseExpression('$root')
        .getValue({
          myString: 'hello world!'
        });

      expect(local).toMatchSnapshot();
    });
  });

  describe('math', () => {
    it('should add 2 numbers', () => {
      const sum = ExpressionParser.eval('1 + 1');

      expect(sum).toBe(2);
    });

    it('should add 3 numbers', () => {
      const sum = ExpressionParser.eval('1 + 1 + 1');

      expect(sum).toBe(3);
    });

    it('should subtract 2 numbers', () => {
      const difference = ExpressionParser.eval('1 - 1');

      expect(difference).toBe(0);
    });

    it('should multiply 2 numbers', () => {
      const product = ExpressionParser.eval('2 * 2');

      expect(product).toBe(4);
    });

    it('should divide 2 numbers', () => {
      const quotient = ExpressionParser.eval('4 / 2');

      expect(quotient).toBe(2);
    });

    it('should find the modulus of 2 numbers', () => {
      const mod = ExpressionParser.eval('10 % 8');

      expect(mod).toBe(2);
    });

    it('should evaluate an exponent', () => {
      const mod = ExpressionParser.eval('10^2');
      expect(mod).toBe(8);
    });

    it('should honor standard order of operations', () => {
      const math = ExpressionParser.eval('8 + 4 * 6 - 2 * 3 / 2'); // 8+(4*6)-(2*3/2) = 29

      expect(math).toBe(29);
    });
  });

  describe('ternary', () => {
    it('should return first argument if true', () => {
      const tern = ExpressionParser.eval('true ? "yes" : "no"');

      expect(tern).toBe('yes');
    });

    it('should return second argument if false', () => {
      const tern = ExpressionParser.eval('false ? "yes" : "no"');

      expect(tern).toBe('no');
    });
  });

  describe('complex literals', () => {
    it('should create an array', () => {
      const arr = ExpressionParser.eval('[1, 2, 3, 4]');
      expect(arr).toEqual([1, 2, 3, 4]);
    });

    // it.only('should create a map', () => {
    //   const map = ExpressionParser.eval('val = { name: "Nikola", dob: "10-July-1856" }');

    //   expect(map).toEqual({ name: 'Nikola', dob: '10-July-1856' });
    // });
  });
});
