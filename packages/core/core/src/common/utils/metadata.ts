/**
 * Assigns the metadata to the class/function under specified `key`.
 * This metadata can be reflected using `Reflector` class.
 */
export const ReflectMetadata = <K = any, V = any>(
  metadataKey: K,
  metadataValue: V
) => (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
  if (descriptor) {
    Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
    return descriptor;
  }
  Reflect.defineMetadata(metadataKey, metadataValue, target);
  return target;
};

export const getMetadata = <T, U = any>(metadataKey: U, target: object): T => {
  return <T>Reflect.getMetadata(metadataKey, target);
};
