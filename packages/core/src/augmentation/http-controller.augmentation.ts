import { HTTP_CONTROLLER_METADATA, HttpController } from '@opra/common';
import type { HttpContext } from '../http/http-context';

declare module '@opra/common' {
  interface HttpControllerStatic {
    OnInit(): PropertyDecorator;

    OnShutdown(): PropertyDecorator;
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  interface HttpController {
    onInit?: (resource: HttpController) => void;
    onShutdown?: (resource: HttpController) => void | Promise<void>;
  }

  namespace HttpController {
    interface InitArguments {
      onInit?: (resource: HttpController) => void;
      onShutdown?: (resource: HttpController) => void | Promise<void>;
    }
  }

  namespace HttpOperation {
    interface Context extends HttpContext {}
  }
}

// @ts-ignore
const oldInitialize = HttpController.prototype._initialize;
// @ts-ignore
HttpController.prototype._initialize = function (this: HttpController, initArgs: HttpController.InitArguments) {
  oldInitialize?.call(this, initArgs);
  this.onInit = initArgs.onInit;
  this.onShutdown = initArgs.onShutdown;
};

HttpController.OnInit = function () {
  return (target: Object, propertyKey: string | symbol): void => {
    const sourceMetadata = (Reflect.getOwnMetadata(HTTP_CONTROLLER_METADATA, target.constructor) || {}) as any;
    sourceMetadata.onInit = target[propertyKey];
    Reflect.defineMetadata(HTTP_CONTROLLER_METADATA, target.constructor, sourceMetadata);
  };
};

HttpController.OnShutdown = function () {
  return (target: Object, propertyKey: string | symbol): void => {
    const sourceMetadata = (Reflect.getOwnMetadata(HTTP_CONTROLLER_METADATA, target.constructor) || {}) as any;
    sourceMetadata.onShutdown = target[propertyKey];
    Reflect.defineMetadata(HTTP_CONTROLLER_METADATA, target.constructor, sourceMetadata);
  };
};
