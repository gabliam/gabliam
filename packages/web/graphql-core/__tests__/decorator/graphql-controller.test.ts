import { reflection } from '@gabliam/core';
import { GabResolver } from '@gabliam/graphql-core';

test('should add Register metadata to a class when decorated with @Resolver()', () => {
  @GabResolver()
  class TestBean {}

  expect(reflection.annotations(TestBean)).toMatchSnapshot();
});
