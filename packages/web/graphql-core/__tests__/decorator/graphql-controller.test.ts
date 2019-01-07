// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { reflection } from '@gabliam/core';
import * as path from 'path';
import { GraphqlController } from '../../src';
import { HeroSchema, PhotoSchema } from '../fixtures/schemas/schema';

test('should add GraphqlController metadata to a class when decorated with @GraphqlController()', () => {
  @GraphqlController()
  class TestBean {}

  expect(reflection.annotations(TestBean)).toMatchSnapshot();
});

test('should add GraphqlController metadata to a class when decorated with @GraphqlController({graphqlFiles: absolute})', () => {
  @GraphqlController({
    graphqlFiles: [
      `${__dirname}/photo/hero.gql`,
      `${__dirname}/photo/photo.gql`,
    ],
  })
  class TestBean {}

  expect(reflection.annotations(TestBean)).toMatchSnapshot();
});

test('should add GraphqlController metadata to a class when decorated with @GraphqlController({graphqlFiles: relative})', () => {
  @GraphqlController({
    graphqlFiles: [`./photo/hero.gql`, `./photo/photo.gql`],
  })
  class TestBean {}

  expect(reflection.annotations(TestBean)).toMatchSnapshot();
});

test('should add GraphqlController metadata to a class when decorated with @GraphqlController({graphqlFiles: relative, pwd})', () => {
  @GraphqlController({
    graphqlFiles: [`./photo/hero.gql`, `./photo/photo.gql`],
    pwd: path.resolve(__dirname, '..'),
  })
  class TestBean {}

  expect(reflection.annotations(TestBean)).toMatchSnapshot();
});

test('should add GraphqlController metadata to a class when decorated with @GraphqlController({schema})', () => {
  @GraphqlController({
    schema: [PhotoSchema, HeroSchema],
  })
  class TestBean {}

  expect(reflection.annotations(TestBean)).toMatchSnapshot();
});

test('should add GraphqlController metadata to a class when decorated with @GraphqlController({graphqlFiles, schema})', () => {
  @GraphqlController({
    graphqlFiles: [`${__dirname}/photo/photo.gql`],
    schema: [HeroSchema],
  })
  class TestBean {}

  expect(reflection.annotations(TestBean)).toMatchSnapshot();
});
