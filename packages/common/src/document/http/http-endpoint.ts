import { StrictOmit, type Type } from 'ts-gems';
import type { ErrorIssue } from 'valgen/typings/core/types';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { URLSearchParamsInit } from '../../types.js';
import { ApiDocumentElement } from '../api-document-element.js';
import { HttpEndpointResponse } from './http-endpoint-response.js';
import { HttpParameter } from './http-parameter.js';
import type { HttpResource } from './http-resource.js';

const NAME_PATTERN = /^\w+$/i;

export namespace HttpEndpoint {
  export interface InitArguments extends Pick<OpraSchema.Http.Endpoint, 'description'> {
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Http.Endpoint, 'parameters' | 'responses' | 'types'> {
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
      throw new TypeError('You must provide name of the parameter');
    const prm = new HttpParameter(this, {...opts, name});
    this.parameters.push(prm);
    return prm;
  }

  getParameter(name: string, location?: OpraSchema.Http.Parameter.Location): HttpParameter | undefined {
    name = name.toLowerCase();
    return this.parameters.find(
        x => {
          if (
              (x.name instanceof RegExp ? x.name.test(name) : x.name.toLowerCase() === name) &&
              (!location || location === x.in)
          )
            return x;
        }
    );
  }

  toJSON(): OpraSchema.Http.Endpoint {
    const schema = omitUndefined<OpraSchema.Http.Endpoint>({
      kind: this.kind,
      description: this.description
    });
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

  parseSearchParams(searchParams: URLSearchParamsInit): Record<string, any> {
    const out = {};
    const onFail = (issue: ErrorIssue) => {
      issue.message = `Parameter parse error. ` + issue.message;
      issue.location = '@parameters';
      return issue;
    }
    searchParams = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams);
    for (const k of searchParams.keys()) {
      const prm = this.getParameter(k);
      if (!prm)
        continue;
      const decode = prm.getDecoder();
      let v: any = searchParams?.getAll(k);
      try {
        if (!prm.isArray) {
          v = decode(v[0], {coerce: true, label: k, onFail});
        } else {
          v = v.map(x => decode(x, {coerce: true, label: k, onFail})).flat();
          if (!v.length)
            v = undefined;
        }
        if (v !== undefined)
          out[k] = v;
      } catch (e: any) {
        e.message = `Error parsing parameter ${k}. ` + e.message;
        throw e;
      }
    }
    return out;
  }
}
