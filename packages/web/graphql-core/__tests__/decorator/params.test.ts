// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { reflection } from '@gabliam/core/src';
import {
  Args,
  Context,
  GraphqlController,
  Info,
  Parent,
  Query,
} from '../../src';

[
  { decorator: Args, decoratorName: 'Args' },
  { decorator: Context, decoratorName: 'Context' },
  { decorator: Info, decoratorName: 'Info' },
  { decorator: Parent, decoratorName: 'Parent' },
].forEach(({ decorator, decoratorName }) => {
  describe(`${decoratorName} TU`, () => {
    test(`should add ${decoratorName} metadata to a method when decorated with @${decoratorName}()`, () => {
      @GraphqlController()
      class TestBean {
        @Query()
        test1(@decorator() value: any): any {
          return async () => {
            return [];
          };
        }
      }

      expect(reflection.parameters(TestBean, 'test1')).toMatchSnapshot();
    });

    test(`should add ${decoratorName} metadata to a method when decorated with @${decoratorName}(path)`, () => {
      @GraphqlController()
      class TestBean {
        @Query()
        test1(@decorator('test') value: any): any {
          return async () => {
            return [];
          };
        }
      }

      expect(reflection.parameters(TestBean, 'test1')).toMatchSnapshot();
    });
  });
});
