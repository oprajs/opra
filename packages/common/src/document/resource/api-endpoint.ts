import { StrictOmit } from 'ts-gems';
import type { ErrorIssue } from 'valgen/typings/core/types';
import { omitUndefined } from '../../helpers/index.js';
import type { OpraSchema } from '../../schema/index.js';
import type { URLSearchParamsInit } from '../../types.js';
import { ApiElement } from './api-element.js';
import { ApiParameter } from './api-parameter.js';
import { ApiResponse } from './api-response.js';
import type { Resource } from './resource.js';


export namespace ApiEndpoint {
  export interface InitArguments extends StrictOmit<OpraSchema.Endpoint, 'headers' | 'parameters' | 'response'> {
    headers?: ApiParameter.InitArguments[];
    parameters?: ApiParameter.InitArguments[];
    response?: ApiResponse.InitArguments;
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Endpoint, 'headers' | 'parameters' | 'response'> {
    headers?: ApiParameter.DecoratorMetadata[];
    parameters?: ApiParameter.DecoratorMetadata[];
    response?: ApiResponse.DecoratorMetadata;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Endpoint, 'headers' | 'parameters' | 'response'>> {
  }

}


/**
 *
 * @class ApiEndpoint
 */
export abstract class ApiEndpoint extends ApiElement {
  abstract readonly kind: 'action' | 'operation';
  readonly resource: Resource;
  readonly name: string;
  description?: string;
  headers: ApiParameter[];
  parameters: ApiParameter[];
  response: ApiResponse;
  options: any;

  protected constructor(resource: Resource, name: string, init: ApiEndpoint.InitArguments) {
    super(resource.document);
    this.resource = resource;
    this.name = name;
    this.description = init.description;
    this.headers = [];
    this.parameters = [];
    this.options = {...init.options};
    this.response = new ApiResponse(this, init.response);
    if (init.headers) {
      for (const p of init.headers) {
        this.defineHeader(p);
      }
    }
    if (init.parameters) {
      for (const p of init.parameters) {
        this.defineParameter(p);
      }
    }
  }

  getFullPath(documentPath?: boolean): string {
    return this.resource.getFullPath(documentPath) +
        (this.kind === 'action' ? (documentPath ? '/actions/' : '/') + this.name : '')
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

  defineParameter(init: ApiParameter.InitArguments): ApiParameter
  defineParameter(name: string | RegExp, options?: StrictOmit<ApiParameter.InitArguments, 'name'>): ApiParameter
  defineParameter(arg0: any, arg1?: any): ApiParameter {
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
    const prm = new ApiParameter(this, {...opts, name});
    this.parameters.push(prm);
    return prm;
  }

  getHeader(name: string): ApiParameter | undefined {
    name = name.toLowerCase();
    return this.headers.find(
        x => x.name instanceof RegExp ? x.name.exec(name) : x.name.toLowerCase() === name
    );
  }

  getParameter(name: string): ApiParameter | undefined {
    name = name.toLowerCase();
    return this.parameters.find(
        x => x.name instanceof RegExp ? x.name.test(name) : x.name.toLowerCase() === name
    );
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Endpoint {
    const schema = omitUndefined<OpraSchema.Endpoint>({
      description: this.description
    });
    if (this.headers.length) {
      schema.headers = [];
      for (const prm of this.headers) {
        schema.headers.push(prm.exportSchema(options));
      }
    }
    if (this.parameters.length) {
      let i = 0;
      const parameters: OpraSchema.Parameter[] = [];
      for (const prm of this.parameters) {
        if (!prm.isBuiltin) {
          parameters.push(prm.exportSchema(options));
          i++;
        }
      }
      if (i)
        schema.parameters = parameters;
    }
    if (Object.keys(this.options).length)
      schema.options = {...this.options};
    return schema;
  }

  parseParameters(searchParams: URLSearchParamsInit): Record<string, any> {
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
