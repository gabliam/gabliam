// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { GraphqlController } from '../../src/decorator';
import { METADATA_KEY } from '../../src/constants';
import { ControllerMetadata } from '../../src/interfaces';
import { PhotoSchema, HeroSchema } from '../fixtures/schemas/schema';
import * as path from 'path';

test('should add GraphqlController metadata to a class when decorated with @GraphqlController()', () => {
  @GraphqlController()
  class TestBean {}

  const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
    METADATA_KEY.controller,
    TestBean
  );

  expect(controllerMetadata).toMatchSnapshot();
});

test('should add GraphqlController metadata to a class when decorated with @GraphqlController({graphqlFiles: absolute})', () => {
  @GraphqlController({
    graphqlFiles: [
      `${__dirname}/photo/hero.gql`,
      `${__dirname}/photo/photo.gql`
    ]
  })
  class TestBean {}

  const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
    METADATA_KEY.controller,
    TestBean
  );

  expect(controllerMetadata).toMatchSnapshot();
});

test('should add GraphqlController metadata to a class when decorated with @GraphqlController({graphqlFiles: relative})', () => {
  @GraphqlController({
    graphqlFiles: [`./photo/hero.gql`, `./photo/photo.gql`]
  })
  class TestBean {}

  const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
    METADATA_KEY.controller,
    TestBean
  );

  expect(controllerMetadata).toMatchSnapshot();
});

test('should add GraphqlController metadata to a class when decorated with @GraphqlController({graphqlFiles: relative, pwd})', () => {
  @GraphqlController({
    graphqlFiles: [`./photo/hero.gql`, `./photo/photo.gql`],
    pwd: path.resolve(__dirname, '..')
  })
  class TestBean {}

  const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
    METADATA_KEY.controller,
    TestBean
  );

  expect(controllerMetadata).toMatchSnapshot();
});

test('should add GraphqlController metadata to a class when decorated with @GraphqlController({schema})', () => {
  @GraphqlController({
    schema: [PhotoSchema, HeroSchema]
  })
  class TestBean {}

  const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
    METADATA_KEY.controller,
    TestBean
  );

  expect(controllerMetadata).toMatchSnapshot();
});

test('should add GraphqlController metadata to a class when decorated with @GraphqlController({graphqlFiles, schema})', () => {
  @GraphqlController({
    graphqlFiles: [`${__dirname}/photo/photo.gql`],
    schema: [HeroSchema]
  })
  class TestBean {}

  const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
    METADATA_KEY.controller,
    TestBean
  );

  expect(controllerMetadata).toMatchSnapshot();
});
