import { makeDecorator, Register } from '@gabliam/core';
import { EventSubscriber as typeormEventSubscriber } from 'typeorm';
import { TYPE } from '../constant';

/**
 * Type of the `EventSubscriber` decorator / constructor function.
 */
export interface EventSubscriberDecorator {
  /**
   * This decorator is used to mark classes that will be an EventSubscriber.
   * Classes decorated with this decorator will listen to ORM events and their methods will be triggered when event
   * occurs. Those classes must implement EventSubscriberInterface interface.
   *
   * @usageNotes
   *
   * ```typescript
   * @EventSubscriber()
   * export class PostSubscriber implements EntitySubscriberInterface<Post> {
   *  /**
   *   * Indicates that this subscriber only listen to Post events.
   *   *\/
   *  listenTo() {
   *    return Post;
   *  }
   *  /**
   *   * Called before post insertion.
   *   *\/
   *  beforeInsert(event: InsertEvent<Post>) {
   *    console.log(`BEFORE POST INSERTED: `, event.entity);
   *  }
   * }
   * ```
   */
  (): ClassDecorator;

  /**
   * see the `@Entity` decorator.
   */
  new (): any;
}

export const EventSubscriber: EventSubscriberDecorator = makeDecorator(
  'Entity',
  undefined,
  cls => {
    Register({ type: TYPE.EventSubscriber, id: cls, autobind: false })(cls);
    typeormEventSubscriber()(cls);
  }
);
