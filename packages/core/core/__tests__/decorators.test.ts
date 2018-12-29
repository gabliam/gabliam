// tslint:disable:one-line
// tslint:disable:no-unused-expression
import * as Joi from 'joi';
import {
  Bean,
  BeforeCreate,
  Config,
  Init,
  InjectContainer,
  OnMissingBean,
  Plugin,
  PluginConfig,
  PreDestroy,
  reflection,
  Register,
  Scan,
  Service,
  Value,
} from '../src';
import { TYPE } from '../src/constants';
import { CoreConfig } from '../src/metadata/config';

describe('@init', () => {
  test('should add init metadata to a class when decorating a method with @init', () => {
    @Config()
    class TestBean {
      @Init()
      testMethod() {}

      @Init()
      test2Method() {}
    }

    expect(
      reflection.propMetadataOfDecorator(TestBean, Init)
    ).toMatchSnapshot();
  });
});

describe('@BeforeCreate', () => {
  test('should add BeforeCreate metadata to a class when decorating a method with @BeforeCreate', () => {
    @Config()
    class TestBean {
      @BeforeCreate()
      testMethod() {}

      @BeforeCreate()
      test2Method() {}
    }

    expect(
      reflection.propMetadataOfDecorator(TestBean, BeforeCreate)
    ).toMatchSnapshot();
  });
});

describe('@InjectContainer', () => {
  test('should add InjectContainer metadata to a class when decorating a method with @InjectContainer', () => {
    @InjectContainer()
    @Config()
    class TestBean {}

    expect(
      reflection.annotationsOfDecorator(TestBean, InjectContainer)
    ).toMatchSnapshot();
  });
});

describe('@Bean', () => {
  test('should add Bean metadata to a class when decorated with @Bean', () => {
    class TestBean {
      @Bean('test')
      testMethod() {}

      @Bean('test2')
      test2Method() {}
    }
    expect(
      reflection.propMetadataOfDecorator(TestBean, Bean)
    ).toMatchSnapshot();
  });

  test('should add Bean metadata to a class when decorated multiple times with @Bean', () => {
    class TestBean {
      @Bean('test')
      testMethod() {}

      @Bean('test2')
      @Bean('test3')
      test2Method() {}
    }

    expect(
      reflection.propMetadataOfDecorator(TestBean, Bean)
    ).toMatchSnapshot();
  });
}); // end describe @Bean

describe('@OnMissingBean', () => {
  test('should add OnMissingBean metadata to a class when decorated with @OnMissingBean', () => {
    class TestBean {
      @OnMissingBean('OnMissingBean')
      @Bean('test')
      testMethod() {}

      @OnMissingBean('OnMissingBean2')
      @Bean('test2')
      test2Method() {}
    }

    expect(
      reflection.propMetadataOfDecorator(TestBean, OnMissingBean)
    ).toMatchSnapshot();
  });

  test('should add OnMissingBean metadata to a class when decorated multiple times with @OnMissingBean', () => {
    class TestBean {
      @OnMissingBean('OnMissingBean')
      @Bean('test')
      testMethod() {}

      @OnMissingBean('OnMissingBean1')
      @OnMissingBean('OnMissingBean2')
      @Bean('test2')
      @Bean('test3')
      test2Method() {}
    }

    expect(
      reflection.propMetadataOfDecorator(TestBean, OnMissingBean)
    ).toMatchSnapshot();
  });
}); // end describe @Bean

describe('@Config', () => {
  test('should add Registry and config metadata to a class when decorated with @Config', () => {
    @Config()
    class TestBean {}

    expect(reflection.annotations(TestBean)).toMatchSnapshot();
  });

  test('should add Registry and config metadata to a class when decorated with @Config(100)', () => {
    @Config(100)
    class TestBean {}

    expect(reflection.annotations(TestBean)).toMatchSnapshot();
  });

  test('should fail when decorated multiple times with @Config', () => {
    expect(function() {
      @Config()
      @Config()
      class TestBean {}

      new TestBean();
    }).toThrowError();
  });
}); // end describe @Config

describe('@PluginConfig', () => {
  test('should add Registry and config metadata to a class when decorated with @PluginConfig', () => {
    @PluginConfig()
    class TestBean {}

    expect(reflection.annotations(TestBean)).toMatchSnapshot();
  });

  test('should add Registry and config metadata to a class when decorated with @PluginConfig(100)', () => {
    @PluginConfig(100)
    class TestBean {}

    expect(reflection.annotations(TestBean)).toMatchSnapshot();
  });

  test('should fail when decorated multiple times with @Config', () => {
    expect(function() {
      @PluginConfig()
      @PluginConfig()
      class TestBean {}

      new TestBean();
    }).toThrowError();
  });
}); // end describe @Config

describe('@CoreConfig', () => {
  test('should add Registry and config metadata to a class when decorated with @CoreConfig', () => {
    @CoreConfig()
    class TestBean {}

    expect(reflection.annotations(TestBean)).toMatchSnapshot();
  });

  test('should add Registry and config metadata to a class when decorated with @CoreConfig(100)', () => {
    @CoreConfig(100)
    class TestBean {}

    expect(reflection.annotations(TestBean)).toMatchSnapshot();
  });

  test('should fail when decorated multiple times with @CoreConfig', () => {
    expect(function() {
      @CoreConfig()
      @CoreConfig()
      class TestBean {}

      new TestBean();
    }).toThrowError();
  });
}); // end describe @Config

describe('@Register', () => {
  test('should add Registry metadata to a class when decorated with @Register', () => {
    @Register({ type: TYPE.Config, id: TestBean })
    class TestBean {}

    expect(
      reflection.annotationsOfDecorator(TestBean, Register)
    ).toMatchSnapshot();
  });
}); // end describe @Register

describe('@Scan', () => {
  test('should add Scan metadata to a class when decorated with @Scan()', () => {
    @Scan()
    class TestBean {}

    expect(reflection.annotationsOfDecorator(TestBean, Scan)).toMatchSnapshot();
  });

  test('should add Scan metadata to a class when decorated with @Scan(relativePath)', () => {
    @Scan('./fixtures/loader')
    class TestBean {}

    expect(reflection.annotationsOfDecorator(TestBean, Scan)).toMatchSnapshot();
  });

  test('should add Scan metadata to a class when decorated with @Scan(relativePath) 2', () => {
    @Scan('../src')
    class TestBean {}

    expect(reflection.annotationsOfDecorator(TestBean, Scan)).toMatchSnapshot();
  });

  test('should add Scan metadata to a class when decorated with @Scan(__dirname)', () => {
    @Scan(__dirname)
    class TestBean {}

    expect(reflection.annotationsOfDecorator(TestBean, Scan)).toMatchSnapshot();
  });

  test('should add Scan metadata to a class when decorated multiple times with @Scan', () => {
    @Scan(__dirname)
    @Scan(`${__dirname}/otherFolder`)
    class TestBean {}

    expect(reflection.annotationsOfDecorator(TestBean, Scan)).toMatchSnapshot();
  });
}); // end describe @Scan

describe('@Service', () => {
  test('should add Service metadata to a class when decorated with @Service', () => {
    @Service()
    class TestBean {}

    expect(reflection.annotations(TestBean)).toMatchSnapshot();
  });

  test(`should add Service metadata to a class when decorated with @Service('Test)`, () => {
    @Service('Test')
    class TestBean {}

    expect(reflection.annotations(TestBean)).toMatchSnapshot();
  });
}); // end describe @Service

describe('@Value', () => {
  describe('@Value(options: ValueOptions)', () => {
    test('should add Value metadata to a class when decorated with @Value(options: ValueOptions)', () => {
      class TestBean {
        @Value({ path: 'application.name' })
        name: string;
        @Value({ path: 'application.surname', validator: Joi.string() })
        surname: string;
        @Value({
          path: 'application.surname',
          validator: { schema: Joi.string() },
        })
        firstname: string;
        @Value({
          path: 'application.postalcode',
          validator: {
            schema: Joi.string().required(),
            customErrorMsg: 'Error',
          },
        })
        postalcode: string;
        @Value({
          path: 'application.address',
          validator: Joi.string().required(),
        })
        address: string;
      }

      expect(
        reflection.propMetadataOfDecorator(TestBean, Value)
      ).toMatchSnapshot();
    });
  }); // end @Value(options: ValueOptions)

  test('should fail whit bad value', () => {
    expect(function() {
      class TestBean {
        @Value(<any>{ lol: 'application.name' })
        name: string;
      }

      new TestBean();
    }).toThrowError();
  });
}); // end describe @Value

describe('@Plugin', () => {
  test('should add Plugin metadata to a class when decorated with @Plugin()', () => {
    @Plugin()
    class TestBean {}
    expect(
      reflection.annotationsOfDecorator(TestBean, Plugin)
    ).toMatchSnapshot();
  });

  test(`should add Plugin metadata to a class when decorated with @Plugin('TestPlugin')`, () => {
    @Plugin('TestPlugin')
    class TestBean {}
    expect(
      reflection.annotationsOfDecorator(TestBean, Plugin)
    ).toMatchSnapshot();
  });

  test(`should add Plugin metadata to a class when decorated with @Plugin({ dependencies: ['TestPlugin'] })`, () => {
    @Plugin({ dependencies: ['TestPlugin'] })
    class TestBean {}
    expect(
      reflection.annotationsOfDecorator(TestBean, Plugin)
    ).toMatchSnapshot();
  });

  test(`should add Plugin metadata to a class when decorated with @Plugin({ name: 'TestPlugin' })`, () => {
    @Plugin({ name: 'TestPlugin' })
    class TestBean {}
    expect(
      reflection.annotationsOfDecorator(TestBean, Plugin)
    ).toMatchSnapshot();
  });

  test(`should add Plugin metadata to a class when decorated with @Plugin({ name: 'TestPlugin', dependencies: ['TestPlugin2'] })`, () => {
    @Plugin({ name: 'TestPlugin', dependencies: ['TestPlugin2'] })
    class TestBean {}
    expect(
      reflection.annotationsOfDecorator(TestBean, Plugin)
    ).toMatchSnapshot();
  });

  test('should fail when decorated multiple times with @Plugin', () => {
    expect(function() {
      @Plugin()
      @Plugin()
      class TestBean {}

      new TestBean();
    }).toThrowError();
  });

  test('should fail whit bad value', () => {
    expect(function() {
      @Plugin(<any>{ lol: 'application.name' })
      class TestBean {}

      new TestBean();
    }).toThrowError();
  });
});

describe('@preDestroy', () => {
  test('should add preDestroy metadata to a class when decorated with @preDestroy', () => {
    class TestBean {
      @PreDestroy()
      preDestroy() {}

      @PreDestroy()
      preDestroy2() {}
    }
    expect(
      reflection.propMetadataOfDecorator(TestBean, PreDestroy)
    ).toMatchSnapshot();
  });
});
