import { RegistryMetada } from '@gabliam/core/lib/interfaces';
import { METADATA_KEY } from '../../src/constants';
import { CUnit } from '../../src/index';

describe('Cunit decorators', () => {
  test('should add Cunit metadata to a class when decorating a method with @Cunit', () => {
    @CUnit('default')
    class TestEntity {}

    const entityMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.cunit,
      TestEntity
    );

    expect(entityMetadata).toMatchSnapshot();
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
