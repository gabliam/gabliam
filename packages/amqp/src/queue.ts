import { QueueOptions } from './interfaces';

/**
 * Represent a queue
 */
export class Queue {
  constructor(public queueName: string, public queueOptions: QueueOptions) {}
}
