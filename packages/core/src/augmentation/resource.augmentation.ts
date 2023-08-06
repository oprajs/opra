import type { Writable } from 'ts-gems';
import { Collection, METADATA_KEY, Resource, Singleton } from "@opra/common";

declare module "@opra/common" {
  interface CollectionConstructor {
    OnInit();

    OnShutdown();
  }

  interface SingletonConstructor {
    OnInit();

    OnShutdown();
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  interface Resource {
    onInit?: (resource: Resource) => void | Promise<void>;
    onShutdown?: (resource: Resource) => void | Promise<void>;
  }

  namespace Resource {
    interface InitArguments {
      onInit?: (resource: Resource) => void | Promise<void>;
      onShutdown?: (resource: Resource) => void | Promise<void>;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace Collection {
    interface Metadata {
      onInit?: (resource: Collection) => void | Promise<void>;
      onShutdown?: (resource: Collection) => void | Promise<void>;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace Singleton {
    interface Metadata {
      onInit?: (resource: Singleton) => void | Promise<void>;
      onShutdown?: (resource: Singleton) => void | Promise<void>;
    }
  }
}

// @ts-ignore
const oldConstruct = Resource.prototype._construct;
// @ts-ignore
Resource.prototype._construct = function (init: Resource.InitArguments) {
  oldConstruct.call(this, init);
  const _this = this as Writable<Resource>;
  _this.onInit = init.onInit;
  _this.onShutdown = init.onShutdown;
}

Collection.OnInit = Singleton.OnInit = function () {
  return (target: Object, propertyKey: string | symbol): void => {
    const resourceMetadata = (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as any;
    resourceMetadata.onInit = target[propertyKey];
    Reflect.defineMetadata(METADATA_KEY, target.constructor, resourceMetadata);
  }
}

Collection.OnShutdown = Singleton.OnShutdown = function () {
  return (target: Object, propertyKey: string | symbol): void => {
    const resourceMetadata = (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as any;
    resourceMetadata.onShutdown = target[propertyKey];
    Reflect.defineMetadata(METADATA_KEY, target.constructor, resourceMetadata);
  }
}
