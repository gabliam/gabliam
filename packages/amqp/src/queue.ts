import { QueueOptions } from './interfaces';

export class Queue {
  constructor(public queueName: string, public queueOptions: QueueOptions) {}
}
