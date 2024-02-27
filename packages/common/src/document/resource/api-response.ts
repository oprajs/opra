import { StrictOmit, Type } from 'ts-gems';
import { isAny, Validator } from 'valgen';
import { HttpStatusCode, HttpStatusRange } from '../../http/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataType } from '../data-type/data-type.js';
import type { ApiEndpoint } from './api-endpoint.js';
import { ApiMediaContent } from './api-media-content.js';
import { ApiParameter } from './api-parameter.js';


/**
 * @namespace ApiResponse
 */
export namespace ApiResponse {
  export interface InitArguments extends StrictOmit<OpraSchema.Response, 'type' | 'headers' | 'multipartFields'> {
    type?: DataType | string | Type;
    multipartFields?: Record<string, ApiMediaContent.InitArguments>;
    headers?: ApiParameter.InitArguments[];
  }

  export interface DecoratorMetadata extends Partial<StrictOmit<OpraSchema.Response, 'type' | 'headers' | 'multipartFields'>> {
    type?: Type | string;
    multipartFields?: Record<string, ApiMediaContent.DecoratorMetadata>;
    headers?: ApiParameter.DecoratorMetadata[];
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Response, 'statusCode' | 'type' | 'headers' | 'multipartFields'>> {
    statusCode: HttpStatusCode | number | HttpStatusRange | HttpStatusRange[];
    type?: Type | string;
  }
}


export class ApiResponse extends ApiMediaContent {
  protected _encoder: Validator;
  readonly parent: ApiEndpoint;
  statusCode: HttpStatusRange[];
  headers: ApiParameter[] = [];

  constructor(endpoint: ApiEndpoint, init: ApiResponse.InitArguments) {
    super(endpoint, init);
    this.statusCode = init?.statusCode
        ? (Array.isArray(init.statusCode) ? init.statusCode : String(init.statusCode)) as HttpStatusRange[]
        : ['200'];
    if (init?.type)
      this.type = init.type instanceof DataType
          ? init.type
          : this.document.getDataType(init.type);
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

  exportSchema(): OpraSchema.Response {
    const out = super.exportSchema() as OpraSchema.Response;
    out.statusCode = this.statusCode.length > 1 ? this.statusCode : this.statusCode[0];
    if (this.headers.length) {
      out.headers = [];
      for (const header of this.headers) {
        out.headers.push(header.exportSchema());
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
