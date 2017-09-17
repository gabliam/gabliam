// tslint:disable:one-line
// tslint:disable:no-unused-expression
import {
  QueryResolver,
  MutationResolver,
  SubscriptionResolver,
  Resolver,
  GraphqlController
} from '../../src/decorator';
import { METADATA_KEY } from '../../src/constants';
import { ResolverMetadata } from '../../src/interfaces';
import { PhotoSchema } from '../fixtures/schemas/schema';
import * as path from 'path';

[
  QueryResolver,
  MutationResolver,
  SubscriptionResolver,
  Resolver
].forEach(decorator => {
  describe(`${decorator.name} TU`, () => {
    test(`should add ${decorator.name} metadata to a class when decorated with @${decorator.name}()`, () => {
      @GraphqlController()
      class TestBean {
        @decorator()
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator()
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      const resolverMetadata: ResolverMetadata[] = Reflect.getMetadata(
        METADATA_KEY.resolver,
        TestBean
      );

      expect(resolverMetadata).toMatchSnapshot();
    });

    test(`should add ${decorator.name} metadata to a class when decorated with @${decorator.name}({graphqlFiles: absolute})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      const resolverMetadata: ResolverMetadata[] = Reflect.getMetadata(
        METADATA_KEY.resolver,
        TestBean
      );

      expect(resolverMetadata).toMatchSnapshot();
    });

    test(`should add ${decorator.name} metadata to a class when decorated with @${decorator.name}({graphqlFiles: relative})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          graphqlFile: `./photo/photo.gql`
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          graphqlFile: `./photo/photo.gql`
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      const resolverMetadata: ResolverMetadata[] = Reflect.getMetadata(
        METADATA_KEY.resolver,
        TestBean
      );

      expect(resolverMetadata).toMatchSnapshot();
    });

    test(`should add ${decorator.name} metadata to a class when decorated with @${decorator.name}({graphqlFiles: relative, pwd})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          graphqlFile: `./photo/photo.gql`,
          pwd: path.resolve(__dirname, '..')
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          graphqlFile: `./photo/photo.gql`,
          pwd: path.resolve(__dirname, '..')
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      const resolverMetadata: ResolverMetadata[] = Reflect.getMetadata(
        METADATA_KEY.resolver,
        TestBean
      );

      expect(resolverMetadata).toMatchSnapshot();
    });

    test(`should add ${decorator.name} metadata to a class when decorated with @ ${decorator.name}({schema})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          schema: PhotoSchema
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          schema: PhotoSchema
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      const resolverMetadata: ResolverMetadata[] = Reflect.getMetadata(
        METADATA_KEY.resolver,
        TestBean
      );

      expect(resolverMetadata).toMatchSnapshot();
    });

    test(`should add  ${decorator.name} metadata to a class when decorated with @${decorator.name}({graphqlFiles, schema})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`,
          schema: PhotoSchema
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`,
          schema: PhotoSchema
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      const resolverMetadata: ResolverMetadata[] = Reflect.getMetadata(
        METADATA_KEY.resolver,
        TestBean
      );

      expect(resolverMetadata).toMatchSnapshot();
    });

    test(`should add ${decorator.name} metadata to a class when decorated with @${decorator.name}({graphqlFiles, schema, path})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`,
          schema: PhotoSchema,
          path: 'lol'
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`,
          schema: PhotoSchema,
          path: 'lol2'
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      const resolverMetadata: ResolverMetadata[] = Reflect.getMetadata(
        METADATA_KEY.resolver,
        TestBean
      );

      expect(resolverMetadata).toMatchSnapshot();
    });
  });
});
