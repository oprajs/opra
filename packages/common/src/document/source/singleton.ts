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
import { Source } from './source.js';

const NESTJS_INJECTABLE_WATERMARK = '__injectable__'; // todo, put this in nextjs package wia augmentation
const NAME_PATTERN = /^(.*)(Source|Resource|Singleton|Controller)$/;

export namespace Singleton {
  export interface InitArguments extends Source.InitArguments,
      StrictOmit<OpraSchema.Singleton, 'kind' | 'type'> {
    type: ComplexType;
  }

  export interface DecoratorOptions extends Source.DecoratorOptions {

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

  export type CreateEndpointOptions = OpraSchema.Singleton.CreateEndpoint;
  export type DeleteEndpointOptions = OpraSchema.Singleton.DeleteEndpoint;
  export type GetEndpointOptions = OpraSchema.Singleton.GetEndpoint;
  export type UpdateEndpointOptions = OpraSchema.Singleton.UpdateEndpoint;
}

class SingletonClass extends Source {
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
    const out = Source.prototype.exportSchema.call(this) as OpraSchema.Singleton;
    Object.assign(out, omitUndefined({
      type: this.type.name,
      operations: this.operations
    }));
    return out;
  }

  normalizeFieldPath(this: Singleton, path: string | string[]): string[] | undefined {
    return this.type.normalizeFieldPath(path);
  }


  getDecoder(endpoint: keyof OpraSchema.Singleton.Operations): vg.Validator<any, any> {
    let decoder = this._decoders[endpoint];
    if (decoder)
      return decoder;
    const options: GenerateDecoderOptions = {
      partial: endpoint !== 'create'
    };
    decoder = generateCodec(this.type, 'decode', options);
    this._decoders[endpoint] = decoder;
    return decoder;
  }

  getEncoder(endpoint: keyof OpraSchema.Singleton.Operations): vg.Validator<any, any> {
    let encoder = this._encoders[endpoint];
    if (encoder)
      return encoder;
    const options: GenerateDecoderOptions = {
      partial: true
    };
    encoder = generateCodec(this.type, 'encode', options);
    this._encoders[endpoint] = encoder;
    return encoder;
  }

}

export interface SingletonConstructor {
  prototype: Singleton;

  new(document: ApiDocument, init: Singleton.InitArguments): Singleton;

  (type: TypeThunkAsync | string, options?: Singleton.DecoratorOptions): ClassDecorator;

  Create: (options?: Singleton.CreateEndpointOptions) => ((target: Object, propertyKey: 'create') => void);
  Delete: (options?: Singleton.DeleteEndpointOptions) => ((target: Object, propertyKey: 'delete') => void);
  Get: (options?: Singleton.GetEndpointOptions) => ((target: Object, propertyKey: 'get') => void);
  Update: (options?: Singleton.UpdateEndpointOptions) => ((target: Object, propertyKey: 'update') => void);
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

function createEndpointDecorator<T>(endpoint: string) {
  return (options?: T) =>
      ((target: Object, propertyKey: string): void => {
        if (propertyKey !== endpoint)
          throw new TypeError(`Name of the handler name should be '${endpoint}'`);
        const endpointMeta = {...options};
        const sourceMetadata =
            (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as Singleton.Metadata;
        sourceMetadata.operations = sourceMetadata.operations || {};
        sourceMetadata.operations[endpoint] = endpointMeta;
        Reflect.defineMetadata(METADATA_KEY, sourceMetadata, target.constructor);
      });
}

Singleton.Create = createEndpointDecorator('create');
Singleton.Get = createEndpointDecorator('get');
Singleton.Delete = createEndpointDecorator('delete');
Singleton.Update = createEndpointDecorator('update');
