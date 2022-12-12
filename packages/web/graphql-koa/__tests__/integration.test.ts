import { GraphqlPluginTest } from './graphql-plugin-test';
import { HeroResolver } from './fixtures/resolvers/hero-resolver';

let appTest: GraphqlPluginTest;
beforeEach(async () => {
  appTest = new GraphqlPluginTest();
  appTest.addClass(HeroResolver);
  await appTest.buildAndStart();
});

afterEach(async () => {
  await appTest.destroy();
});

test('Query test', async () => {
  const res = await appTest
    .supertest()
    .post('/graphql')
    .send({
      query: `query {heroes {
        id,
        name
      }}`,
      variables: null,
    })
    .set('Accept', 'application/json')
    .expect(200);

  expect(res).toMatchSnapshot();
});

test('Mutation test', async () => {
  const res = await appTest
    .supertest()
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
          amountPeopleSaved: 1000,
        },
      },
      operationName: 'submitHero',
    })
    .set('Accept', 'application/json')
    .expect(200);

  expect(res).toMatchSnapshot();
  const ctrl = appTest.gab.container.get(HeroResolver);
  expect(ctrl.heroRepository).toMatchSnapshot();
});
