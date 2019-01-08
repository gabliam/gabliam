// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { reflection } from '@gabliam/core/src';
import * as path from 'path';
import {
  GqlResolveType,
  GraphqlController,
  Mutation,
  Query,
  ResolveMap,
  Subscription,
} from '../../src';
import { PhotoSchema } from '../fixtures/schemas/schema';

[
  { decorator: Query, decoratorName: 'QueryResolver' },
  { decorator: Mutation, decoratorName: 'MutationResolver' },
  { decorator: Subscription, decoratorName: 'SubscriptionResolver' },
  { decorator: ResolveMap, decoratorName: 'MapResolver' },
  { decorator: GqlResolveType, decoratorName: 'GqlResolveType' },
].forEach(({ decorator, decoratorName }) => {
  describe(`${decoratorName} TU`, () => {
    test(`should add ${decoratorName} metadata to a class when decorated with @${decoratorName}()`, () => {
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

      expect(reflection.propMetadata(TestBean)).toMatchSnapshot();
    });

    test(`should add ${decoratorName} metadata to a class when decorated with @${decoratorName}({graphqlFiles: absolute})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`,
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`,
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      expect(reflection.propMetadata(TestBean)).toMatchSnapshot();
    });

    test(`should add ${decoratorName} metadata to a class when decorated with @${decoratorName}({graphqlFiles: relative})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          graphqlFile: `./photo/photo.gql`,
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          graphqlFile: `./photo/photo.gql`,
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      expect(reflection.propMetadata(TestBean)).toMatchSnapshot();
    });

    test(`should add ${decoratorName} metadata to a class when decorated with @${decoratorName}({graphqlFiles: relative, pwd})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          graphqlFile: `./photo/photo.gql`,
          pwd: path.resolve(__dirname, '..'),
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          graphqlFile: `./photo/photo.gql`,
          pwd: path.resolve(__dirname, '..'),
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      expect(reflection.propMetadata(TestBean)).toMatchSnapshot();
    });

    test(`should add ${decoratorName} metadata to a class when decorated with @ ${decoratorName}({schema})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          schema: PhotoSchema,
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          schema: PhotoSchema,
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      expect(reflection.propMetadata(TestBean)).toMatchSnapshot();
    });

    test(`should add  ${decoratorName} metadata to a class when decorated with @${decoratorName}({graphqlFiles, schema})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`,
          schema: PhotoSchema,
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`,
          schema: PhotoSchema,
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      expect(reflection.propMetadata(TestBean)).toMatchSnapshot();
    });

    test(`should add ${decoratorName} metadata to a class when decorated with @${decoratorName}({graphqlFiles, schema, path})`, () => {
      @GraphqlController()
      class TestBean {
        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`,
          schema: PhotoSchema,
          path: 'lol',
        })
        test1(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }

        @decorator({
          graphqlFile: `${__dirname}/photo/photo.gql`,
          schema: PhotoSchema,
          path: 'lol2',
        })
        test2(): any {
          return async (obj: any, args: any, context: any, info: any) => {
            return [];
          };
        }
      }

      expect(reflection.propMetadata(TestBean)).toMatchSnapshot();
    });
  });
});
