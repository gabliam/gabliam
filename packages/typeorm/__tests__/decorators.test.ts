import { RegistryMetada } from '@gabliam/core/lib/interfaces';
import { Entity, ChildEntity, CUnit } from '../src/decorators';
import { METADATA_KEY as CORE_METADATA_KEY } from '@gabliam/core/lib/constants';
import { METADATA_KEY } from '../src/constant';

[Entity, ChildEntity].forEach(deco => {
  test(`${deco.name} decorators`, () => {
    @deco()
    class TestEntity {}

    const entityMetadata: RegistryMetada = Reflect.getMetadata(
      CORE_METADATA_KEY.register,
      TestEntity
    );

    expect(entityMetadata).toMatchSnapshot();
  });
});

describe('CUnit decorators', () => {
  test('should add CUnit metadata to a class when decorating a method with @CUnit', () => {
    @CUnit('default')
    class TestEntity {}

    const entityMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.cunit,
      TestEntity
    );

    expect(entityMetadata).toMatchSnapshot();
  });

  test('should fail when decorated multiple times with @CUnit', () => {
    expect(function() {
      @CUnit('default')
      @CUnit('default2')
      class TestBean {}

      // tslint:disable-next-line:no-unused-expression
      new TestBean();
    }).toThrowError();
  });
});
