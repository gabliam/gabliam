export const config = {
  url: 'amqp://localhost',
  queues: {
    listener: {
      queueName: 'listenerTest',
      options: {
        durable: false
      }
    },
    consummer: {
      queueName: 'consumerTest',
      options: {
        durable: false
      }
    }
  }
};
