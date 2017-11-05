import { GraphqlPluginTest } from './graphql-plugin-test';
import { HeroController } from './fixtures/controllers/heroController';
import { PhotoController } from './fixtures/controllers/photoController';
import * as supertest from 'supertest';
import * as path from 'path';

let appTest: GraphqlPluginTest;
beforeEach(async () => {
  appTest = new GraphqlPluginTest();
  appTest.addClass(HeroController);
  appTest.addClass(PhotoController);
  appTest.addConf('application.graphql.graphqlFiles', [
    path.resolve(__dirname, './fixtures/controllers/schemas/photoinput.gql')
  ]);
  await appTest.build();
});

afterEach(async () => {
  await appTest.destroy();
});

test('Query test', async () => {
  const res = await supertest(appTest.app)
    .post('/graphql')
    .send({
      query: `query {heroes {
        id,
        name
      }}`,
      variables: null
    })
    .set('Accept', 'application/json')
    .expect(200);

  expect(res).toMatchSnapshot();
});

test('Mutation test', async () => {
  const res = await supertest(appTest.app)
    .post('/graphql')
    .send({
      query: `mutation submitHero($heroInput: HeroInput!) {
        submitHero(heroInput: $heroInput) {
          id,
          name
        }
      }`,
      variables: {
        heroInput: {
          name: 'Rogue',
          power: 'Absorption of abilities',
          amountPeopleSaved: 1000
        }
      },
      operationName: 'submitHero'
    })
    .set('Accept', 'application/json')
    .expect(200);

  expect(res).toMatchSnapshot();
  const ctrl = appTest.gab.container.get(HeroController);
  expect(ctrl.heroRepository).toMatchSnapshot();
});
