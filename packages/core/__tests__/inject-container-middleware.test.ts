import { createContainer } from '../src/container';
import { APP_CONFIG, INJECT_CONTAINER_KEY } from '../src/constants';
import { Container, Config, Value, InjectContainer } from '../src/index';

let container: Container;

describe('Inject container', () => {
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
  test('Inject Container test', () => {
    @InjectContainer()
    @Config()
    class Conf {}

    container
      .bind(Conf)
      .to(Conf)
      .inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
    expect((<any>conf)[INJECT_CONTAINER_KEY]).toBeDefined();
    expect((<any>conf)[INJECT_CONTAINER_KEY]).toBe(container);
  });

  test('Inject Container does not break @Value', () => {
    @InjectContainer()
    @Config()
    class Conf {
      @Value('application.express.rootPath') rootPath: string;

      @Value('application.express.hostname') hostname: string;
    }

    container
      .bind(Conf)
      .to(Conf)
      .inSingletonScope();
    const conf = container.get<Conf>(Conf);
    expect(conf).toMatchSnapshot();
    expect((<any>conf)[INJECT_CONTAINER_KEY]).toBeDefined();
    expect((<any>conf)[INJECT_CONTAINER_KEY]).toBe(container);
  });
});
