import { reflection } from '@gabliam/core/src';
import { CUnit } from '../../src/index';

describe('Cunit decorators', () => {
  test('should add Cunit metadata to a class when decorating a method with @Cunit', () => {
    @CUnit('default')
    class TestEntity {}

    expect(reflection.annotations(TestEntity)).toMatchSnapshot();
  });

  test('should fail when decorated multiple times with @Cunit', () => {
    expect(function() {
      @CUnit('default')
      @CUnit('default2')
      class TestBean {}

      // tslint:disable-next-line:no-unused-expression
      new TestBean();
    }).toThrowError();
  });
});
