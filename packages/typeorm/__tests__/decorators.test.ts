import { METADATA_KEY as CORE_METADATA_KEY } from '@gabliam/core/lib/constants';
import { RegistryMetada } from '@gabliam/core/lib/interfaces';
import { METADATA_KEY } from '../src/constant';
import { ChildEntity, CUnit, Entity } from '../src/decorators';

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

  test('should add CUnit metadata to a class when decorating multiple times with @CUnit', () => {
    @CUnit('default')
    @CUnit('default2')
    class TestEntity {}

    const entityMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.cunit,
      TestEntity
    );

    expect(entityMetadata).toMatchSnapshot();
  });
});
