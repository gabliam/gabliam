// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { reflection } from '@gabliam/core';
import '../../src';
import { Resolver } from 'type-graphql';

test('should add Register metadata to a class when decorated with @Resolver()', () => {
  @Resolver()
  class TestBean {}

  expect(reflection.annotations(TestBean)).toMatchSnapshot();
});
