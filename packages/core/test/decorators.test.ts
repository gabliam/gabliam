// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { expect } from 'chai';
import {
  Bean,
  Config,
  register,
  Scan,
  Service,
  Value
} from '../src/decorators';
import { METADATA_KEY, TYPE, ORDER_CONFIG } from '../src/constants';
import { BeanMetadata, RegistryMetada, ValueMetadata } from '../src/interfaces';
import * as Joi from 'joi';

describe('Unit Test: Decorators', () => {
  describe('@Bean', () => {
    it('should add Bean metadata to a class when decorated with @Bean', () => {
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
      expect(beanMetadata).to.be.an('array');
      expect(beanMetadata).to.have.lengthOf(2);
      expect(beanMetadata).to.deep.equal([
        { id: 'test', key: 'testMethod' },
        { id: 'test2', key: 'test2Method' }
      ]);
    });

    it('should add Bean metadata to a class when decorated multiple times with @Bean', () => {
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
      expect(beanMetadata).to.be.an('array');
      expect(beanMetadata).to.have.lengthOf(3);
      expect(beanMetadata).to.deep.equal([
        { id: 'test', key: 'testMethod' },
        { id: 'test3', key: 'test2Method' },
        { id: 'test2', key: 'test2Method' }
      ]);
    });
  }); // end describe @Bean

  describe('@Config', () => {
    it('should add Registry and config metadata to a class when decorated with @Config', () => {
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

      expect(configMetadata).to.be.an('boolean').that.be.true;

      expect(registryMetadata).to.have.property('type', TYPE.Config);
      expect(registryMetadata).to.have.property('value');
      expect(registryMetadata).to.have.nested.property('value.id', TestBean);
      expect(registryMetadata).to.have.nested.property(
        'value.order',
        ORDER_CONFIG.Config
      );
      expect(registryMetadata).to.have.nested.property(
        'value.target',
        TestBean
      );
    });

    it('should fail when decorated multiple times with @Config', () => {
      expect(function() {
        @Config()
        @Config()
        class TestBean {}

        new TestBean();
      }).to.throw();
    });
  }); // end describe @Config

  describe('@Register', () => {
    it('should add Registry metadata to a class when decorated with @Register', () => {
      @register(TYPE.Config, {})
      class TestBean {}

      const registryMetadata: RegistryMetada = Reflect.getMetadata(
        METADATA_KEY.register,
        TestBean
      );

      expect(registryMetadata).to.have.property('type', TYPE.Config);
      expect(registryMetadata).to.have.property('value').that.be.empty;
    });

    it('should fail when decorated multiple times with @Register', () => {
      expect(function() {
        @register(TYPE.Config, {})
        @register(TYPE.Service, {})
        class TestBean {}

        new TestBean();
      }).to.throw();
    });
  }); // end describe @Register

  describe('@Scan', () => {
    it('should add Scan metadata to a class when decorated with @Scan', () => {
      @Scan(__dirname)
      class TestBean {}

      const scanMetadata: RegistryMetada = Reflect.getMetadata(
        METADATA_KEY.scan,
        TestBean
      );

      expect(scanMetadata).to.be.an('array');
      expect(scanMetadata).to.have.lengthOf(1);
      expect(scanMetadata).to.deep.equal([__dirname]);
    });

    it('should add Scan metadata to a class when decorated multiple times with @Scan', () => {
      @Scan(__dirname)
      @Scan(`${__dirname}/otherFolder`)
      class TestBean {}

      const scanMetadata: string[] = Reflect.getMetadata(
        METADATA_KEY.scan,
        TestBean
      );

      expect(scanMetadata).to.be.an('array');
      expect(scanMetadata).to.have.lengthOf(2);
      expect(scanMetadata).to.deep.equal([
        `${__dirname}/otherFolder`,
        __dirname
      ]);
    });
  }); // end describe @Scan

  describe('@Service', () => {
    it('should add Service metadata to a class when decorated with @Service', () => {
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

      expect(serviceMetadata).to.be.a('boolean').that.be.true;
      expect(registryMetadata).to.have.property('type', TYPE.Service);
      expect(registryMetadata).to.have.property('value');
      expect(registryMetadata).to.have.nested.property('value.id', TestBean);
      expect(registryMetadata).to.have.nested.property(
        'value.target',
        TestBean
      );
    });

    it(`should add Service metadata to a class when decorated with @Service('Test)`, () => {
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

      expect(serviceMetadata).to.be.an('boolean').that.be.true;
      expect(registryMetadata).to.have.property('type', TYPE.Service);
      expect(registryMetadata).to.have.property('value');
      expect(registryMetadata).to.have.nested.property('value.id', 'Test');
      expect(registryMetadata).to.have.nested.property(
        'value.target',
        TestBean
      );
    });

    it('should fail when decorated multiple times with @Service', () => {
      expect(function() {
        @Service()
        @Service()
        class TestBean {}

        new TestBean();
      }).to.throw();
    });
  }); // end describe @Service

  describe('@Value', () => {
    describe('@Value(options: ValueOptions)', () => {
      it('should add Value metadata to a class when decorated with @Value(options: ValueOptions)', () => {
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
        console.log(valueMetadata);
        // expect(valueMetadata).to.be.an('array');
        // expect(valueMetadata).to.have.lengthOf(5);
        // expect(valueMetadata).to.deep.equal([
        //   {
        //     path: 'application.name',
        //     target: new TestBean(),
        //     key: 'name',
        //     validator: null
        //   },
        //   {
        //     path: 'application.surname',
        //     target: new TestBean(),
        //     key: 'surname',
        //     validator: { throwError: true, schema: Joi.string() }
        //   },
        //   {
        //     path: 'application.surname',
        //     target: new TestBean(),
        //     key: 'firstname',
        //     validator: { throwError: true, schema: Joi.string() }
        //   },
        //   {
        //     path: 'application.postalcode',
        //     target: new TestBean(),
        //     key: 'postalcode',
        //     validator: {
        //       throwError: true,
        //       schema: Joi.string(),
        //       customErrorMsg: 'Error'
        //     }
        //   },
        //   {
        //     path: 'application.address',
        //     target: new TestBean(),
        //     key: 'address',
        //     validator: { throwError: true, schema: Joi.string() }
        //   }
        // ]);
      });
    }); // end @Value(options: ValueOptions)
  }); // end describe @Value
});
