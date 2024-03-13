import { StrictOmit, Type } from 'ts-gems';
import { isAny, Validator } from 'valgen';
import { HttpStatusCode } from '../../http/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataType } from '../data-type/data-type.js';
import type { HttpEndpoint } from './http-endpoint.js';
import { HttpMediaContent } from './http-media-content.js';
import { HttpParameter } from './http-parameter.js';


/**
 * @namespace HttpResponse
 */
export namespace HttpResponse {
  export interface InitArguments extends StrictOmit<OpraSchema.Http.Response, 'type' | 'headers' | 'multipartFields'> {
    type?: DataType | string;
    multipartFields?: Record<string, HttpMediaContent.InitArguments>;
    headers?: HttpParameter.InitArguments[];
  }

  export interface DecoratorMetadata extends Partial<StrictOmit<OpraSchema.Http.Response, 'type' | 'headers' | 'multipartFields'>> {
    type?: Type | string;
    multipartFields?: Record<string, HttpMediaContent.DecoratorMetadata>;
    headers?: HttpParameter.DecoratorMetadata[];
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Http.Response, 'statusCode' | 'type' | 'headers' | 'multipartFields'>> {
    statusCode: HttpStatusCode | number | HttpStatusRange | HttpStatusRange[];
    type?: Type | string;
  }
}


export class HttpResponse extends HttpMediaContent {
  protected _encoder: Validator;
  readonly parent: HttpEndpoint;
  statusCode: HttpStatusRange[];
  headers: HttpParameter[] = [];

  constructor(endpoint: HttpEndpoint, init: HttpResponse.InitArguments) {
    super(endpoint, init);
    this.statusCode =
        Array.isArray(init.statusCode)
            ? init.statusCode.map((x: any) => new HttpStatusRange(x))
            : [new HttpStatusRange(init.statusCode as any || 200)];
    if (init.type) {
      if (init.type instanceof DataType) {
        this.type = init.type.isEmbedded ? init.type : this.findDataType(init.type.name!);
        if (!this.type)
          throw new TypeError(`Datatype (${init.type.name!}) given for endpoint response "${this.statusCode}" is not belong to this document scope`);
      } else {
        this.type = this.findDataType(init.type);
        if (!this.type)
          throw new TypeError(`Datatype (${init.type}) given for endpoint response "${this.statusCode}" could not be found in document scope`);
      }
    }
    if (init?.headers) {
      for (const p of init.headers) {
        this.defineHeader(p);
      }
    }
  }

  defineHeader(init: HttpParameter.InitArguments): HttpParameter
  defineHeader(name: string | RegExp, options?: StrictOmit<HttpParameter.InitArguments, 'name'>): HttpParameter
  defineHeader(arg0: any, arg1?: any): HttpParameter {
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
    const prm = new HttpParameter(this, {...opts, name});
    this.headers.push(prm);
    return prm;
  }

  getHeader(name: string): HttpParameter | undefined {
    name = name.toLowerCase();
    return this.headers.find(
        x => x.name instanceof RegExp ? x.name.exec(name) : x.name.toLowerCase() === name
    );
  }

  toJSON(): OpraSchema.Http.Response {
    const out = super.toJSON() as OpraSchema.Http.Response;
    out.statusCode = this.statusCode.length > 1
        ? this.statusCode.map(x => x.toString())
        : this.statusCode[0].toString();
    if (this.headers.length) {
      out.headers = [];
      for (const header of this.headers) {
        out.headers.push(header.toJSON());
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


const STATUS_RANGE_PATTERN = /^([1-6]\d{2})(?:-([1-6]\d{2}))?$/;

/**
 * @class HttpStatusRange
 */
export class HttpStatusRange {
  start: number = 0;
  end: number = 0;

  constructor(start: number | string, end?: number)
  constructor(init: Pick<HttpStatusRange, 'start' | 'end'>)
  constructor(arg0: any, arg1?: number) {
    if (arg0 && typeof arg0 === 'object') {
      this.start = arg0.start || 0;
      this.end = arg0.end || 0;
    }
    if (typeof arg0 === 'number') {
      this.start = arg0;
      this.end = arg1 || this.start;
    }
    if (typeof arg0 === 'string') {
      const m = STATUS_RANGE_PATTERN.exec(arg0);
      if (!m)
        throw new TypeError(`"${arg0}" is not a valid Status Code range`);
      this.start = parseInt(m[1], 10);
      this.end = m[2] ? parseInt(m[2], 10) : this.start;
    }
  }

  toString(): string {
    if (this.start === this.end)
      return String(this.start);
    else return String(this.start) + '-' + String(this.end);
  }

  toJSON(): string {
    return this.toString();
  }

}
