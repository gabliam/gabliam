import { reflection } from '@gabliam/core';
import * as mongoose from 'mongoose';
import { Document, MUnit } from '../src';

test(`@Document('Hero') decorator`, () => {
  @Document('Hero')
  class Hero {
    static getSchema() {
      return new mongoose.Schema({
        name: {
          type: String,
          required: true,
        },
      });
    }
  }

  expect(reflection.annotations(Hero)).toMatchSnapshot();
});

test(`@Document(DocumentOptions without collectionName)  decorator`, () => {
  @Document({
    name: 'Hero',
    schema: new mongoose.Schema({
      name: {
        type: String,
        required: true,
      },
    }),
  })
  class Hero {}

  expect(reflection.annotations(Hero)).toMatchSnapshot();
});

test(`@Document(DocumentOptions)  decorator`, () => {
  @Document({
    name: 'Hero',
    collectionName: 'HeroCollection',
    schema: new mongoose.Schema({
      name: {
        type: String,
        required: true,
      },
    }),
  })
  class Hero {}

  expect(reflection.annotations(Hero)).toMatchSnapshot();
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

describe('MUnit decorators', () => {
  test('should add MUnit metadata to a class when decorating a method with @MUnit', () => {
    @MUnit('default')
    class TestEntity {}

    expect(reflection.annotations(TestEntity)).toMatchSnapshot();
  });

  test('should fail when decorated multiple times with @MUnit', () => {
    expect(function() {
      @MUnit('default')
      @MUnit('default2')
      class TestBean {}

      // tslint:disable-next-line:no-unused-expression
      new TestBean();
    }).toThrowError();
  });
});
