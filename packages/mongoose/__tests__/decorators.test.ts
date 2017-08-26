import { RegistryMetada } from '@gabliam/core/lib/interfaces';
import { Document } from '../src';
import { METADATA_KEY as CORE_METADATA_KEY } from '@gabliam/core/lib/constants';
import { DocumentMetadata } from '../src/interfaces/index';
import { METADATA_KEY } from '../src/constants';
import * as mongoose from 'mongoose';

test(`@Document('Hero') decorator`, () => {
  @Document('Hero')
  class Hero {
    static getSchema() {
      return new mongoose.Schema({
        name: {
          type: String,
          required: true
        }
      });
    }
  }

  const entityMetadata: RegistryMetada = Reflect.getMetadata(
    CORE_METADATA_KEY.register,
    Hero
  );

  const documentMetadata: DocumentMetadata = Reflect.getOwnMetadata(
    METADATA_KEY.document,
    Hero
  );

  expect(entityMetadata).toMatchSnapshot();
  expect(documentMetadata).toMatchSnapshot();
});

test(`@Document(DocumentOptions without collectionName)  decorator`, () => {
  @Document({
    name: 'Hero',
    schema: new mongoose.Schema({
      name: {
        type: String,
        required: true
      }
    })
  })
  class Hero {}

  const entityMetadata: RegistryMetada = Reflect.getMetadata(
    CORE_METADATA_KEY.register,
    Hero
  );

  const documentMetadata: DocumentMetadata = Reflect.getOwnMetadata(
    METADATA_KEY.document,
    Hero
  );

  expect(entityMetadata).toMatchSnapshot();
  expect(documentMetadata).toMatchSnapshot();
});

test(`@Document(DocumentOptions)  decorator`, () => {
  @Document({
    name: 'Hero',
    collectionName: 'HeroCollection',
    schema: new mongoose.Schema({
      name: {
        type: String,
        required: true
      }
    })
  })
  class Hero {}

  const entityMetadata: RegistryMetada = Reflect.getMetadata(
    CORE_METADATA_KEY.register,
    Hero
  );

  const documentMetadata: DocumentMetadata = Reflect.getOwnMetadata(
    METADATA_KEY.document,
    Hero
  );

  expect(entityMetadata).toMatchSnapshot();
  expect(documentMetadata).toMatchSnapshot();
});

describe('errors', () => {
  test('no getSchema', () => {
    expect(() => {
      @Document('Hero')
      class Hero {}
      // tslint:disable-next-line:no-unused-expression
      new Hero();
    }).toThrowError();
  });

  test('getSchema return bad info', () => {
    expect(() => {
      @Document('Hero')
      class Hero {
        static getSchema() {
          return 'lol';
        }
      }
      // tslint:disable-next-line:no-unused-expression
      new Hero();
    }).toThrowError();
  });
});
