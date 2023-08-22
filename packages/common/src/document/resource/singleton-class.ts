import { Type } from 'ts-gems';
import * as vg from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { ComplexType } from '../data-type/complex-type.js';
import { generateCodec, GenerateDecoderOptions } from '../utils/generate-codec.js';
import { Resource } from './resource.js';
import type { Singleton } from './singleton.js';

export class SingletonClass extends Resource {
  private _decoders: Record<string, vg.Validator> = {};
  private _encoders: Record<string, vg.Validator> = {};
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
    return {
      ...super.exportSchema() as OpraSchema.Singleton,
      ...omitUndefined({
        type: this.type.name || 'any',
        operations: this.operations
      })
    };
  }

  normalizeFieldPath(path: string | string[]): string[] | undefined {
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
