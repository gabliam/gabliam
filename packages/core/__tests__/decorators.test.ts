// tslint:disable:one-line
// tslint:disable:no-unused-expression
import {
  Bean,
  Config,
  PluginConfig,
  register,
  Scan,
  Service,
  Value
} from '../src/decorators';
import { CoreConfig } from '../src/decorators/config';
import { METADATA_KEY, TYPE } from '../src/constants';
import { BeanMetadata, RegistryMetada, ValueMetadata } from '../src/interfaces';
import * as Joi from 'joi';

describe('@Bean', () => {
  test('should add Bean metadata to a class when decorated with @Bean', () => {
    class TestBean {
      @Bean('test')
      testMethod() {}

      @Bean('test2')
      test2Method() {}
    }

    const beanMetadata: BeanMetadata[] = Reflect.getMetadata(
      METADATA_KEY.bean,
      TestBean
    );

    expect(beanMetadata).toMatchSnapshot();
  });

  test('should add Bean metadata to a class when decorated multiple times with @Bean', () => {
    class TestBean {
      @Bean('test')
      testMethod() {}

      @Bean('test2')
      @Bean('test3')
      test2Method() {}
    }

    const beanMetadata: BeanMetadata[] = Reflect.getMetadata(
      METADATA_KEY.bean,
      TestBean
    );
    expect(beanMetadata).toMatchSnapshot();
  });
}); // end describe @Bean

describe('@Config', () => {
  test('should add Registry and config metadata to a class when decorated with @Config', () => {
    @Config()
    class TestBean {}

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.register,
      TestBean
    );

    const configMetadata: boolean | undefined = Reflect.getMetadata(
      METADATA_KEY.config,
      TestBean
    );

    expect(configMetadata).toMatchSnapshot();
    expect(registryMetadata).toMatchSnapshot();
  });

  test('should add Registry and config metadata to a class when decorated with @Config(100)', () => {
    @Config(100)
    class TestBean {}

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.register,
      TestBean
    );

    const configMetadata: boolean | undefined = Reflect.getMetadata(
      METADATA_KEY.config,
      TestBean
    );

    expect(configMetadata).toMatchSnapshot();
    expect(registryMetadata).toMatchSnapshot();
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

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.register,
      TestBean
    );

    const configMetadata: boolean | undefined = Reflect.getMetadata(
      METADATA_KEY.config,
      TestBean
    );

    expect(configMetadata).toMatchSnapshot();
    expect(registryMetadata).toMatchSnapshot();
  });

  test('should add Registry and config metadata to a class when decorated with @PluginConfig(100)', () => {
    @PluginConfig(100)
    class TestBean {}

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.register,
      TestBean
    );

    const configMetadata: boolean | undefined = Reflect.getMetadata(
      METADATA_KEY.config,
      TestBean
    );

    expect(configMetadata).toMatchSnapshot();
    expect(registryMetadata).toMatchSnapshot();
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

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.register,
      TestBean
    );

    const configMetadata: boolean | undefined = Reflect.getMetadata(
      METADATA_KEY.config,
      TestBean
    );

    expect(configMetadata).toMatchSnapshot();
    expect(registryMetadata).toMatchSnapshot();
  });

  test('should add Registry and config metadata to a class when decorated with @CoreConfig(100)', () => {
    @CoreConfig(100)
    class TestBean {}

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.register,
      TestBean
    );

    const configMetadata: boolean | undefined = Reflect.getMetadata(
      METADATA_KEY.config,
      TestBean
    );

    expect(configMetadata).toMatchSnapshot();
    expect(registryMetadata).toMatchSnapshot();
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
    @register(TYPE.Config, {})
    class TestBean {}

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.register,
      TestBean
    );

    expect(registryMetadata).toMatchSnapshot();
  });

  test('should fail when decorated multiple times with @Register', () => {
    expect(function() {
      @register(TYPE.Config, {})
      @register(TYPE.Service, {})
      class TestBean {}

      new TestBean();
    }).toThrowError();
  });
}); // end describe @Register

describe('@Scan', () => {
  test('should add Scan metadata to a class when decorated with @Scan', () => {
    @Scan(__dirname)
    class TestBean {}

    const scanMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.scan,
      TestBean
    );

    expect(scanMetadata).toMatchSnapshot();
  });

  test('should add Scan metadata to a class when decorated multiple times with @Scan', () => {
    @Scan(__dirname)
    @Scan(`${__dirname}/otherFolder`)
    class TestBean {}

    const scanMetadata: string[] = Reflect.getMetadata(
      METADATA_KEY.scan,
      TestBean
    );
    expect(scanMetadata).toMatchSnapshot();
  });
}); // end describe @Scan

describe('@Service', () => {
  test('should add Service metadata to a class when decorated with @Service', () => {
    @Service()
    class TestBean {}

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.register,
      TestBean
    );

    const serviceMetadata: boolean | undefined = Reflect.getMetadata(
      METADATA_KEY.service,
      TestBean
    );
    expect(serviceMetadata).toMatchSnapshot();
    expect(registryMetadata).toMatchSnapshot();
  });

  test(`should add Service metadata to a class when decorated with @Service('Test)`, () => {
    @Service('Test')
    class TestBean {}

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      METADATA_KEY.register,
      TestBean
    );

    const serviceMetadata: boolean = Reflect.getMetadata(
      METADATA_KEY.service,
      TestBean
    );

    expect(serviceMetadata).toMatchSnapshot();
    expect(registryMetadata).toMatchSnapshot();
  });

  test('should fail when decorated multiple times with @Service', () => {
    expect(function() {
      @Service()
      @Service()
      class TestBean {}

      new TestBean();
    }).toThrowError();
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
          validator: { schema: Joi.string() }
        })
        firstname: string;
        @Value({
          path: 'application.postalcode',
          validator: {
            schema: Joi.string().required(),
            customErrorMsg: 'Error'
          }
        })
        postalcode: string;
        @Value({
          path: 'application.address',
          validator: Joi.string().required()
        })
        address: string;
      }

      const valueMetadata: ValueMetadata[] = Reflect.getMetadata(
        METADATA_KEY.value,
        TestBean
      );
      expect(valueMetadata).toMatchSnapshot();
    });
  }); // end @Value(options: ValueOptions)
}); // end describe @Value
