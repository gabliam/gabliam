import { METADATA_KEY, ERRORS_MSGS } from '../constants';
import { makeDecorator } from '@gabliam/core';

/**
 * Type of the `MUnit` decorator / constructor function.
 */
export interface MUnitDecorator {
  /**
   * Decorator that marks a class (a mongo Document) to use a specific connection
   *
   * @usageNotes
   *
   * ```typescript
   * @MUnit('test')
   * @Document('Hero')
   * export class Hero {
   *   static getSchema() {
   *     const schema = new mongoose.Schema({
   *       name: {
   *         type: String,
   *         required: true,
   *       },
   *       power: {
   *         type: String,
   *         required: true,
   *       },
   *       amountPeopleSaved: {
   *         type: Number,
   *         required: false,
   *       },
   *       createdAt: {
   *         type: Date,
   *         required: false,
   *       },
   *       modifiedAt: {
   *         type: Date,
   *         required: false,
   *       },
   *     });
   *
   *     schema.pre('save', <any>function(this: HeroModel, next: any) {
   *       if (this) {
   *         const now = new Date();
   *         if (!this.createdAt) {
   *           this.createdAt = now;
   *         }
   *         this.modifiedAt = now;
   *       }
   *       next();
   *     });
   *
   *     return schema;
   *   }
   * }
   * ```
   */
  (name: string): ClassDecorator;

  /**
   * see the `@MUnit` decorator.
   */
  new (name: string): any;
}

/**
 * `MUnit` decorator and metadata.
 */
export interface MUnit {
  /**
   * Name of the connection
   */
  name: string;
}

export const MUnit: MUnitDecorator = makeDecorator(
  METADATA_KEY.munit,
  (name: string): MUnit => ({ name }),
  undefined,
  true,
  ERRORS_MSGS.DUPLICATED_MUNIT_DECORATOR
);
