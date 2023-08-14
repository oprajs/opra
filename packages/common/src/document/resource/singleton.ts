import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit, Type } from 'ts-gems';
import * as vg from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { generateCodec, GenerateDecoderOptions } from '../utils/generate-codec.js';
import { Resource } from './resource.js';

const NESTJS_INJECTABLE_WATERMARK = '__injectable__'; // todo, put this in nextjs package wia augmentation
const NAME_PATTERN = /^(.*)(Resource|Singleton)$/;

export namespace Singleton {
  export interface InitArguments extends Resource.InitArguments,
      StrictOmit<OpraSchema.Singleton, 'kind' | 'type'> {
    type: ComplexType;
  }

  export interface DecoratorOptions extends Resource.DecoratorOptions {

  }

  export interface Metadata extends StrictOmit<OpraSchema.Singleton, 'type'> {
    name: string;
    type: TypeThunkAsync | string;
  }

  // Need for augmentation
  export namespace Create {
  }

  // Need for augmentation
  export namespace Delete {
  }

  // Need for augmentation
  export namespace Get {
  }

  // Need for augmentation
  export namespace Update {
  }

  export type CreateOperationOptions = OpraSchema.Singleton.CreateOperation;
  export type DeleteOperationOptions = OpraSchema.Singleton.DeleteOperation;
  export type GetOperationOptions = OpraSchema.Singleton.GetOperation;
  export type UpdateOperationOptions = OpraSchema.Singleton.UpdateOperation;
}

class SingletonClass extends Resource {
  private _decoders: Record<string, vg.Validator<any>> = {};
  private _encoders: Record<string, vg.Validator<any>> = {};
  readonly type: ComplexType;
  readonly kind = OpraSchema.Singleton.Kind;
  readonly operations: OpraSchema.Singleton.Operations;
  readonly controller?: object | Type;

  constructor(
      document: ApiDocument,
      init: Singleton.InitArguments
  ) {
    super(document, init);
    this.controller = init.controller;
    this.operations = {...init.operations};
    this.type = init.type;
  }

  exportSchema(): OpraSchema.Singleton {
    const out = Resource.prototype.exportSchema.call(this) as OpraSchema.Singleton;
    Object.assign(out, omitUndefined({
      type: this.type.name,
      operations: this.operations
    }));
    return out;
  }

  normalizeFieldPath(this: Singleton, path: string | string[]): string[] | undefined {
    return this.type.normalizeFieldPath(path);
  }


  getDecoder(operation: keyof OpraSchema.Singleton.Operations): vg.Validator<any, any> {
    let decoder = this._decoders[operation];
    if (decoder)
      return decoder;
    const options: GenerateDecoderOptions = {
      partial: operation !== 'create'
    };
    decoder = generateCodec(this.type, 'decode', options);
    this._decoders[operation] = decoder;
    return decoder;
  }

  getEncoder(operation: keyof OpraSchema.Singleton.Operations): vg.Validator<any, any> {
    let encoder = this._encoders[operation];
    if (encoder)
      return encoder;
    const options: GenerateDecoderOptions = {
      partial: true
    };
    encoder = generateCodec(this.type, 'encode', options);
    this._encoders[operation] = encoder;
    return encoder;
  }

}

export interface SingletonConstructor {
  prototype: Singleton;

  new(document: ApiDocument, init: Singleton.InitArguments): Singleton;

  (type: TypeThunkAsync | string, options?: Singleton.DecoratorOptions): ClassDecorator;

  Create: (options?: Singleton.CreateOperationOptions) => ((target: Object, propertyKey: 'create') => void);
  Delete: (options?: Singleton.DeleteOperationOptions) => ((target: Object, propertyKey: 'delete') => void);
  Get: (options?: Singleton.GetOperationOptions) => ((target: Object, propertyKey: 'get') => void);
  Update: (options?: Singleton.UpdateOperationOptions) => ((target: Object, propertyKey: 'update') => void);
}

export interface Singleton extends SingletonClass {
}

export const Singleton = function (this: Singleton | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [type, options] = args as [TypeThunkAsync | string, Singleton.DecoratorOptions | undefined];
    return function (target: Function) {
      const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
      const metadata: Singleton.Metadata = Reflect.getOwnMetadata(METADATA_KEY, target) || ({} as any);
      metadata.kind = OpraSchema.Singleton.Kind;
      metadata.name = name;
      metadata.type = type;
      // Merge with previous metadata object
      const m = Reflect.getMetadata(METADATA_KEY, target);
      if (m && metadata !== m)
        Object.assign(metadata, omit(m), Object.keys(metadata));
      // Merge options
      if (options)
        Object.assign(metadata, omit(options, ['kind', 'name', 'type', 'controller']));
      Reflect.defineMetadata(METADATA_KEY, metadata, target);

      /* Define Injectable metadata for NestJS support*/
      Reflect.defineMetadata(NESTJS_INJECTABLE_WATERMARK, true, target);
    }
  }

  // Constructor
  const [document, init] = args as [ApiDocument, Singleton.InitArguments];
  merge(this, new SingletonClass(document, init), {descriptor: true});
} as SingletonConstructor;

Singleton.prototype = SingletonClass.prototype;

function createOperationDecorator<T>(operation: string) {
  return (options?: T) =>
      ((target: Object, propertyKey: string): void => {
        if (propertyKey !== operation)
          throw new TypeError(`Name of the handler name should be '${operation}'`);
        const operationMeta = {...options};
        const resourceMetadata =
            (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as Singleton.Metadata;
        resourceMetadata.operations = resourceMetadata.operations || {};
        resourceMetadata.operations[operation] = operationMeta;
        Reflect.defineMetadata(METADATA_KEY, resourceMetadata, target.constructor);
      });
}

Singleton.Create = createOperationDecorator('create');
Singleton.Get = createOperationDecorator('get');
Singleton.Delete = createOperationDecorator('delete');
Singleton.Update = createOperationDecorator('update');
