import { MethodInfo } from './plugin-config';

/**
 * Execution context for the controller
 */
export class ExecutionContext {
  constructor(private instance: any, private methodInfo: MethodInfo) {}

  getClass<T = any>(): T {
    return this.instance;
  }

  getConstructor<T = object>(): T {
    return this.instance.constructor;
  }

  getHandler(): Function {
    return this.instance[this.methodInfo.methodName];
  }

  getHandlerName(): string | symbol {
    return this.methodInfo.methodName;
  }

  getMethodInfo() {
    return this.methodInfo;
  }
}
