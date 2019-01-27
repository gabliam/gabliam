import { reflection } from '@gabliam/core';
import { ChildEntity, CUnit, Entity } from '../src';

[Entity, ChildEntity].forEach(deco => {
  test(`${deco.name} decorators`, () => {
    @deco()
    class TestEntity {}

    expect(reflection.annotations(TestEntity)).toMatchSnapshot();
  });
});

describe('CUnit decorators', () => {
  test('should add CUnit metadata to a class when decorating a method with @CUnit', () => {
    @CUnit('default')
    class TestEntity {}

    expect(reflection.annotations(TestEntity)).toMatchSnapshot();
  });

  test('should add CUnit metadata to a class when decorating multiple times with @CUnit', () => {
    @CUnit('default')
    @CUnit('default2')
    class TestEntity {}

    expect(reflection.annotations(TestEntity)).toMatchSnapshot();
  });
});
