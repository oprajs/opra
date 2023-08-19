import type { Writable } from 'ts-gems';
import { Collection, METADATA_KEY, Singleton, Source } from "@opra/common";

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
  interface Source {
    onInit?: (source: Source) => void | Promise<void>;
    onShutdown?: (source: Source) => void | Promise<void>;
  }

  namespace Source {
    interface InitArguments {
      onInit?: (source: Source) => void | Promise<void>;
      onShutdown?: (source: Source) => void | Promise<void>;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace Collection {
    interface Metadata {
      onInit?: (source: Collection) => void | Promise<void>;
      onShutdown?: (source: Collection) => void | Promise<void>;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace Singleton {
    interface Metadata {
      onInit?: (source: Singleton) => void | Promise<void>;
      onShutdown?: (source: Singleton) => void | Promise<void>;
    }
  }
}

// @ts-ignore
const oldConstruct = Source.prototype._construct;
// @ts-ignore
Source.prototype._construct = function (init: Source.InitArguments) {
  oldConstruct.call(this, init);
  const _this = this as Writable<Source>;
  _this.onInit = init.onInit;
  _this.onShutdown = init.onShutdown;
}

Collection.OnInit = Singleton.OnInit = function () {
  return (target: Object, propertyKey: string | symbol): void => {
    const sourceMetadata = (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as any;
    sourceMetadata.onInit = target[propertyKey];
    Reflect.defineMetadata(METADATA_KEY, target.constructor, sourceMetadata);
  }
}

Collection.OnShutdown = Singleton.OnShutdown = function () {
  return (target: Object, propertyKey: string | symbol): void => {
    const sourceMetadata = (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as any;
    sourceMetadata.onShutdown = target[propertyKey];
    Reflect.defineMetadata(METADATA_KEY, target.constructor, sourceMetadata);
  }
}
