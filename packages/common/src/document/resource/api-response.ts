import { StrictOmit, Type } from 'ts-gems';
import { isAny, Validator } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { HttpStatusCode } from '../../http/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types';
import { DataType } from '../data-type/data-type.js';
import { ApiElement } from './api-element.js';
import type { ApiEndpoint } from './api-endpoint.js';
import { ApiParameter } from './api-parameter.js';


/**
 * @namespace ApiResponse
 */
export namespace ApiResponse {
  export interface InitArguments extends StrictOmit<OpraSchema.Response, 'type' | 'headers'> {
    type?: DataType | string | Type;
    headers: ApiParameter.InitArguments[];
  }

  export interface DecoratorMetadata extends Partial<StrictOmit<OpraSchema.Response, 'type' | 'headers'>> {
    type?: TypeThunkAsync | string;
    headers?: ApiParameter.DecoratorMetadata[];
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Response, 'type' | 'headers'>> {
    type?: TypeThunkAsync | string;
  }
}


export class ApiResponse extends ApiElement {
  protected _encoder: Validator;
  readonly endpoint: ApiEndpoint;
  description?: string;
  statusCode: HttpStatusCode;
  type?: DataType;
  contentType?: string;
  contentEncoding?: string;
  headers: ApiParameter[] = [];

  constructor(endpoint: ApiEndpoint, init?: ApiResponse.InitArguments) {
    super(endpoint.document);
    this.endpoint = endpoint;
    this.description = init?.description;
    this.statusCode = init?.statusCode || HttpStatusCode.OK;
    if (init?.type)
      this.type = init.type instanceof DataType
          ? init.type
          : this.document.getDataType(init.type);
    this.contentEncoding = init?.contentEncoding;
    this.contentType = init?.contentType;
    if (init?.headers) {
      for (const p of init.headers) {
        this.defineHeader(p);
      }
    }
  }

  defineHeader(init: ApiParameter.InitArguments): ApiParameter
  defineHeader(name: string | RegExp, options?: StrictOmit<ApiParameter.InitArguments, 'name'>): ApiParameter
  defineHeader(arg0: any, arg1?: any): ApiParameter {
    let name: any;
    let opts: any;
    if (typeof arg0 === 'string' || arg0 instanceof RegExp) {
      name = arg0;
      opts = arg1;
    } else {
      name = arg0.name;
      opts = arg0;
    }
    if (!name)
      throw new TypeError('You must provide name of the header');
    const prm = new ApiParameter(this, {...opts, name});
    this.headers.push(prm);
    return prm;
  }

  getHeader(name: string): ApiParameter | undefined {
    name = name.toLowerCase();
    return this.headers.find(
        x => x.name instanceof RegExp ? x.name.exec(name) : x.name.toLowerCase() === name
    );
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Response {
    const out = omitUndefined<OpraSchema.Response>({
      description: this.description,
      statusCode: this.statusCode,
      type: this.type?.name ? this.type.name : this.type?.exportSchema(options),
      contentType: this.contentType,
      contentEncoding: this.contentEncoding
    })
    if (this.headers.length) {
      out.headers = [];
      for (const header of this.headers) {
        out.headers.push(header.exportSchema(options));
      }
    }
    return out;
  }

  getEncoder(): Validator {
    if (!this._encoder) {
      if (this.type)
        this._encoder = this.type.generateCodec('encode', {partial: true, operation: 'read'});
      else this._encoder = isAny;
    }
    return this._encoder;
  }

}
