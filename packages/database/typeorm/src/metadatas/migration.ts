import { makeDecorator, Register } from '@gabliam/core';
import { TYPE } from '../constant';

/**
 * Type of the `MigrationEntity` decorator / constructor function.
 */
export interface MigrationEntityDecorator {
  /**
   * This decorator is used to mark classes that will be a migration entity
   * (table or document depend on database type).
   *
   * @usageNotes
   *
   * ```typescript
   * @MigrationEntity()
   * export class Migration1578993003417 implements MigrationInterface {
   *
   *  public async up(queryRunner: QueryRunner): Promise<any> {
   *  }
   *
   *  public async down(queryRunner: QueryRunner): Promise<any> {
   *  }
   * }
   * ```
   */
  (): ClassDecorator;

  /**
   * see the `@MigrationEntity` decorator.
   */
  new (): any;
}

export const MigrationEntity: MigrationEntityDecorator = makeDecorator(
  'Entity',
  undefined,
  cls => {
    Register({ type: TYPE.Migration, id: cls, autobind: false })(cls);
  }
);
