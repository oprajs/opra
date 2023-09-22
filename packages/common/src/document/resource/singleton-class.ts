import * as vg from 'valgen';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { ComplexType } from '../data-type/complex-type.js';
import type { DataType } from '../data-type/data-type.js';
import type { Endpoint } from './endpoint.js';
import { Resource } from './resource.js';
import type { Singleton } from './singleton.js';
import type { SingletonDecorator } from './singleton-decorator';

export class SingletonClass extends Resource {
  readonly kind: OpraSchema.Resource.Kind = OpraSchema.Singleton.Kind;
  readonly type: ComplexType;
  private _decoders: Record<string, vg.Validator> = {};
  private _encoders: Record<string, vg.Validator> = {};

  constructor(document: ApiDocument, init: Singleton.InitArguments) {
    super(document, init);
    this.type = init.type;
  }

  getOperation(name: 'create'): (Endpoint & Omit<SingletonDecorator.Create.Metadata, keyof Endpoint>) | undefined;
  getOperation(name: 'delete'): (Endpoint & Omit<SingletonDecorator.Delete.Metadata, keyof Endpoint>) | undefined;
  getOperation(name: 'get'): (Endpoint & Omit<SingletonDecorator.Get.Metadata, keyof Endpoint>) | undefined;
  getOperation(name: 'update'): (Endpoint & Omit<SingletonDecorator.Update.Metadata, keyof Endpoint>) | undefined;
  getOperation(name: string): Endpoint | undefined {
    return super.getOperation(name);
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Singleton {
    return {
      ...super.exportSchema(options) as OpraSchema.Singleton,
      type: this.type.name || 'any'
    };
  }

  normalizeFieldPath(path: string | string[]): string[] | undefined {
    return this.type.normalizeFieldPath(path);
  }


  getDecoder(operation: keyof OpraSchema.Singleton.Operations): vg.Validator {
    let decoder = this._decoders[operation];
    if (decoder)
      return decoder;
    const options: DataType.GenerateCodecOptions = {
      partial: operation !== 'create'
    };
    decoder = this.type.generateCodec('decode', options);
    this._decoders[operation] = decoder;
    return decoder;
  }

  getEncoder(operation: keyof OpraSchema.Singleton.Operations): vg.Validator {
    let encoder = this._encoders[operation];
    if (encoder)
      return encoder;
    const options: DataType.GenerateCodecOptions = {
      partial: true
    };
    encoder = this.type.generateCodec('encode', options);
    this._encoders[operation] = encoder;
    return encoder;
  }

}
