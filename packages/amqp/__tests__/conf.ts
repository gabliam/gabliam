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

export const configWithName = {
  url: 'amqp://localhost',
  name: 'test',
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

export const configWith2Connection = [
  {
    url: 'amqp://localhost',
    name: 'connection1',
    queues: {
      listener: {
        queueName: 'listenerTestConnection1',
        options: {
          durable: false
        }
      },
      consummer: {
        queueName: 'consumerTestConnection1',
        options: {
          durable: false
        }
      }
    }
  },
  {
    url: 'amqp://localhost',
    name: 'connection2',
    queues: {
      listener: {
        queueName: 'listenerTestConnection2',
        options: {
          durable: false
        }
      },
      consummer: {
        queueName: 'listenerTestConnection2',
        options: {
          durable: false
        }
      }
    }
  }
];

export const configWithDuplicateConnection = [
  {
    url: 'amqp://localhost',
    name: 'connection1',
    queues: {
      listener: {
        queueName: 'listenerTestConnection1',
        options: {
          durable: false
        }
      },
      consummer: {
        queueName: 'consumerTestConnection1',
        options: {
          durable: false
        }
      }
    }
  },
  {
    url: 'amqp://localhost',
    name: 'connection1',
    queues: {
      listener: {
        queueName: 'listenerTestConnection2',
        options: {
          durable: false
        }
      },
      consummer: {
        queueName: 'listenerTestConnection2',
        options: {
          durable: false
        }
      }
    }
  }
];
