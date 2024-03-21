import { StrictOmit, type Type } from 'ts-gems';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ApiDocumentElement } from '../api-document-element.js';
import { HttpEndpointResponse } from './http-endpoint-response.js';
import { HttpParameter } from './http-parameter.js';
import type { HttpResource } from './http-resource.js';

const NAME_PATTERN = /^\w+$/i;

export namespace HttpEndpoint {
  export interface InitArguments extends Pick<OpraSchema.Http.Endpoint, 'description'> {
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Http.Endpoint, 'headers' | 'parameters' | 'responses' | 'types'> {
    headers?: HttpParameter.DecoratorMetadata[];
    parameters?: HttpParameter.DecoratorMetadata[];
    responses?: HttpEndpointResponse.DecoratorMetadata[];
    types?: Type[];
  }

  export interface FindResponseResult {
    response: HttpEndpointResponse;
    statusCode: number;
    contentType: string;
  }
}


/**
 *
 * @class HttpEndpoint
 */
export abstract class HttpEndpoint extends ApiDocumentElement {
  protected _sortedResponseCache = new ResponsiveMap<HttpEndpointResponse>();
  protected _findResponseCache = new ResponsiveMap<HttpEndpoint.FindResponseResult>();
  readonly parent: HttpResource;
  abstract readonly kind: OpraSchema.Http.Action.Kind | OpraSchema.Http.Operation.Kind;
  readonly name: string;
  description?: string;
  headers: HttpParameter[] = [];
  parameters: HttpParameter[] = [];
  responses: HttpEndpointResponse[] = [];

  protected constructor(parent: HttpResource, name: string, init: HttpEndpoint.InitArguments) {
    super(parent);
    if (!NAME_PATTERN.test(name))
      throw new TypeError(`Invalid endpoint name (${name})`);
    this.name = name;
    this.description = init.description;
  }

  getFullPath(documentPath?: boolean): string {
    return this.parent.getFullPath(documentPath) +
        (documentPath
                ? '/endpoints/' + this.name
                : (this.kind === OpraSchema.Http.Action.Kind ? this.name : '')
        );
  }

  defineResponse(init: HttpEndpointResponse.InitArguments): HttpEndpointResponse {
    const r = new HttpEndpointResponse(this, init);
    this.responses.push(r);
    this._sortedResponseCache.clear();
    this._findResponseCache.clear();
    return r;
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
      throw new TypeError('You must provide name of the Header');
    const prm = new HttpParameter(this, {...opts, name});
    this.headers.push(prm);
    return prm;
  }

  defineParameter(init: HttpParameter.InitArguments): HttpParameter
  defineParameter(name: string | RegExp, options?: StrictOmit<HttpParameter.InitArguments, 'name'>): HttpParameter
  defineParameter(arg0: any, arg1?: any): HttpParameter {
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
      throw new TypeError('You must provide name of the Parameter');
    const prm = new HttpParameter(this, {...opts, name});
    this.parameters.push(prm);
    return prm;
  }

  getHeader(name: string): HttpParameter | undefined {
    name = name.toLowerCase();
    return this.headers.find(
        x => (x.name instanceof RegExp ? x.name.test(name) : x.name.toLowerCase() === name)
    );
  }

  getParameter(name: string): HttpParameter | undefined {
    name = name.toLowerCase();
    return this.parameters.find(
        x => (x.name instanceof RegExp ? x.name.test(name) : x.name.toLowerCase() === name)
    );
  }

  toJSON(): OpraSchema.Http.Endpoint {
    const schema = omitUndefined<OpraSchema.Http.Endpoint>({
      kind: this.kind,
      description: this.description
    });
    if (this.headers.length) {
      let i = 0;
      const headers: OpraSchema.Http.Parameter[] = [];
      for (const prm of this.headers) {
        if (!prm.isBuiltin) {
          headers.push(prm.toJSON());
          i++;
        }
      }
      if (i)
        schema.headers = headers;
    }
    if (this.parameters.length) {
      let i = 0;
      const parameters: OpraSchema.Http.Parameter[] = [];
      for (const prm of this.parameters) {
        if (!prm.isBuiltin) {
          parameters.push(prm.toJSON());
          i++;
        }
      }
      if (i)
        schema.parameters = parameters;
    }
    if (this.responses.length)
      schema.responses = this.responses.map(x => x.toJSON());
    return schema;
  }

}
