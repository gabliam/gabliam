import { interfaces } from 'inversify';
import { BeanMetadata } from '../interfaces';
import { METADATA_KEY } from '../constants';

/**
 * Bean decorator
 *
 * Define a Bean in Config class
 *
 * ## Simple Example
 * Here is an example of a class that define a bean
 *
 * ```
 *  class Gretter {
 *      constructor(private name:string){};
 *      greet() {
 *          return `Hello ${this.name} !`;
 *      }
 *  }
 *
 * @Config()
 * class SampleConfig {
 *      @Bean(Gretter)
 *      createGretter() {
 *          return new Gretter('David');
 *      }
 * }
 *
 * @Service()
 * class SampleService {
 *  constructor(gretter: Gretter) {
 *      console.log(gretter.greet()); // display Hello David !
 *  }
 * }
 * ```
 *
 * @param id id of the class
 */
export function Bean(id: interfaces.ServiceIdentifier<any>) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const metadata: BeanMetadata = { id, key };
    let metadataList: BeanMetadata[] = [];

    if (!Reflect.hasOwnMetadata(METADATA_KEY.bean, target.constructor)) {
      Reflect.defineMetadata(METADATA_KEY.bean, metadataList, target.constructor);
    } else {
      metadataList = Reflect.getOwnMetadata(METADATA_KEY.bean, target.constructor);
    }

    metadataList.push(metadata);
  };
}
