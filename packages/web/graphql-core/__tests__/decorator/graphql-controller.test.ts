// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { reflection } from '@gabliam/core';
import { GabResolver } from '@gabliam/graphql-core';
import '../../src';
test('should add Register metadata to a class when decorated with @Resolver()', () => {
  @GabResolver()
  class TestBean {}

  expect(reflection.annotations(TestBean)).toMatchSnapshot();
});
