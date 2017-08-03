// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { createContainer } from '../src/container';
import { APP_CONFIG } from '../src/constants';
import { Config, Value } from '../src/decorators';
import { inject, optional, Container } from '../src/index';
import * as Joi from 'joi';

let container: Container;

describe('@Value(path: string) Value without others options', () => {
  beforeEach(() => {
    container = createContainer();
    container.bind(APP_CONFIG).toConstantValue({
      application: {
        express: {
          rootPath: '/',
          hostname: 'localhost'
        }
      }
    });
  });
  test('all value in config', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath') rootPath: string;

      @Value('application.express.hostname') hostname: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end all value in config

  test('default value in property', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath') rootPath: string;

      @Value('application.express.port') port = 3000;

      @Value('application.express.hostname') hostname: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end default value in property

  test('with value undefined', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath') rootPath: string;

      @Value('application.express.port') port = 3000;

      @Value('application.express.lol') lol: string;

      @Value('application.express.hostname') hostname: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end whith value undefined

  test('default value in constructor', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath') rootPath: string;

      @Value('application.express.port') port: number;

      @Value('application.express.hostname') hostname: string;

      constructor() {
        this.port = 8080;
      }
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end default value in constructor

  test('default value in constructor and property', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath') rootPath: string;

      @Value('application.express.port') port = 3000;

      @Value('application.express.hostname') hostname: string;

      constructor() {
        this.port = 8080;
      }
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end default value in constructor

  test('default value in other bean', () => {
    container.bind('PORT_CONFIG').toConstantValue(8081);
    @Config()
    class Conf {
      @Value('application.express.rootPath') rootPath: string;

      @Value('application.express.port') port = 3000;

      @Value('application.express.hostname') hostname: string;

      constructor(@inject('PORT_CONFIG') portConfig: number) {
        this.port = portConfig;
      }
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end default value in constructor

  test('default value and optional bean', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath') rootPath: string;

      @Value('application.express.hostname') hostname: string;

      constructor(
        @inject('ROOT_CONFIG')
        @optional()
        rootPath: string
      ) {
        this.rootPath = rootPath;
      }
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end default value and optional bean
}); // end @Value(path: string)

describe('@Value(path: string, schema: Joi.Schema) Value with Schema', () => {
  beforeEach(() => {
    container = createContainer();
    container.bind(APP_CONFIG).toConstantValue({
      application: {
        express: {
          rootPath: '/',
          hostname: 'localhost'
        }
      }
    });
  });
  test('all value in config and respect Validator', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath', Joi.string().required())
      rootPath: string;

      @Value('application.express.hostname', Joi.string().required())
      hostname: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end all value in config

  test('default value in property', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath', Joi.string().required())
      rootPath: string;

      @Value('application.express.port', Joi.number().required())
      port = 3000;

      @Value('application.express.hostname', Joi.string().required())
      hostname: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end default value in property

  test('bad format', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath', Joi.number())
      rootPath: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    expect(() => {
      container.get<Conf>(Conf);
    }).toThrow();
  }); // end bad format

  test('error required', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath', Joi.string())
      rootPath: string;

      @Value('application.express.rootPath', Joi.number().required())
      port: number;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    expect(() => {
      container.get<Conf>(Conf);
    }).toThrow();
  }); // end error required

  test('default value in constructor', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath', Joi.string().required())
      rootPath: string;

      @Value('application.express.port', Joi.number().required())
      port: number;

      @Value('application.express.hostname', Joi.string().required())
      hostname: string;

      constructor() {
        this.port = 8080;
      }
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end default value in constructor

  test('default in joi', () => {
    @Config()
    class Conf {
      @Value('application.express.rootPath', Joi.string().required())
      rootPath: string;

      @Value('application.express.port', Joi.string().default(8088))
      port: number;

      @Value('application.express.hostname', Joi.string().required())
      hostname: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end default value in constructor
}); // end @Value(path: string, schema: Joi.Schema)

describe('@Value(options: ValueOptions) Value with Schema', () => {
  beforeEach(() => {
    container = createContainer();
    container.bind(APP_CONFIG).toConstantValue({
      application: {
        express: {
          rootPath: '/',
          hostname: 'localhost'
        }
      }
    });
  });
  test('all value in config and respect Validator', () => {
    @Config()
    class Conf {
      @Value({
        path: 'application.express.rootPath',
        validator: Joi.string().required()
      })
      rootPath: string;

      @Value({
        path: 'application.express.hostname',
        validator: Joi.string().required()
      })
      hostname: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end all value in config

  test('default value in property', () => {
    @Config()
    class Conf {
      @Value({
        path: 'application.express.rootPath',
        validator: Joi.string().required()
      })
      rootPath: string;

      @Value({
        path: 'application.express.port',
        validator: Joi.number().required()
      })
      port = 3000;

      @Value({
        path: 'application.express.hostname',
        validator: Joi.string().required()
      })
      hostname: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end default value in property

  test('bad format', () => {
    @Config()
    class Conf {
      @Value({
        path: 'application.express.rootPath',
        validator: Joi.number()
      })
      rootPath: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    expect(() => {
      container.get<Conf>(Conf);
    }).toThrow();
  }); // end bad format

  test('bad format custom error', () => {
    @Config()
    class Conf {
      @Value({
        path: 'application.express.rootPath',
        validator: {
          schema: Joi.number(),
          customErrorMsg: 'lol custom'
        }
      })
      rootPath: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    expect(() => {
      container.get<Conf>(Conf);
    }).toThrow('custom');
  }); // end bad format

  test('bad format without throw error', () => {
    @Config()
    class Conf {
      @Value({
        path: 'application.express.rootPath',
        validator: {
          schema: Joi.number(),
          throwError: false
        }
      })
      rootPath: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end bad format

  test('error required', () => {
    @Config()
    class Conf {
      @Value({
        path: 'application.express.rootPath',
        validator: Joi.string()
      })
      rootPath: string;

      @Value({
        path: 'application.express.rootPath',
        validator: Joi.number().required()
      })
      port: number;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    expect(() => {
      container.get<Conf>(Conf);
    }).toThrow();
  }); // end error required

  test('default value in constructor', () => {
    @Config()
    class Conf {
      @Value({
        path: 'application.express.rootPath',
        validator: Joi.string().required()
      })
      rootPath: string;

      @Value({
        path: 'application.express.port',
        validator: Joi.number().required()
      })
      port: number;

      @Value({
        path: 'application.express.hostname',
        validator: Joi.string().required()
      })
      hostname: string;

      constructor() {
        this.port = 8080;
      }
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end default value in constructor

  test('default in joi', () => {
    @Config()
    class Conf {
      @Value({
        path: 'application.express.rootPath',
        validator: Joi.string().required()
      })
      rootPath: string;

      @Value({
        path: 'application.express.port',
        validator: Joi.string().default(8088)
      })
      port: number;

      @Value({
        path: 'application.express.hostname',
        validator: Joi.string().required()
      })
      hostname: string;
    }

    container.bind(Conf).to(Conf).inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
  }); // end default value in constructor
}); // end @Value(path: string, schema: Joi.Schema)
