import * as vg from 'valgen';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { ComplexType } from '../data-type/complex-type.js';
import { generateCodec, GenerateDecoderOptions } from '../utils/generate-codec.js';
import type { Endpoint } from './endpoint.js';
import { Resource } from './resource.js';
import type { SingletonDecorator } from './singleton.decorator.js';
import type { Singleton } from './singleton.js';

export class SingletonClass extends Resource {
  private _decoders: Record<string, vg.Validator> = {};
  private _encoders: Record<string, vg.Validator> = {};
  readonly type: ComplexType;
  readonly kind = OpraSchema.Singleton.Kind;

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

  exportSchema(): OpraSchema.Singleton {
    return {
      ...super.exportSchema() as OpraSchema.Singleton,
      type: this.type.name || 'any'
    };
  }

  normalizeFieldPath(path: string | string[]): string[] | undefined {
    return this.type.normalizeFieldPath(path);
  }


  getDecoder(endpoint: keyof OpraSchema.Singleton.Operations): vg.Validator {
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

  getEncoder(endpoint: keyof OpraSchema.Singleton.Operations): vg.Validator {
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
