import { StrictOmit } from 'ts-gems';
import type { ErrorIssue } from 'valgen/typings/core/types';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { URLSearchParamsInit } from '../../types.js';
import { ApiElement } from './api-element.js';
import { ApiParameter } from './api-parameter.js';
import type { ApiResource } from './api-resource';
import { ApiResponse } from './api-response.js';

const NAME_PATTERN = /^\w+$/i;

export namespace ApiEndpoint {
  export interface InitArguments extends StrictOmit<OpraSchema.Endpoint, 'parameters' | 'responses'> {
    parameters?: ApiParameter.InitArguments[];
    responses?: ApiResponse.InitArguments[];
  }
}


/**
 *
 * @class ApiEndpoint
 */
export abstract class ApiEndpoint extends ApiElement {
  readonly parent: ApiResource;
  abstract readonly kind: OpraSchema.Action.Kind | OpraSchema.Operation.Kind;
  readonly name: string;
  description?: string;
  parameters: ApiParameter[];
  responses: ApiResponse[];

  protected constructor(parent: ApiResource, name: string, init: ApiEndpoint.InitArguments) {
    super(parent);
    if (!NAME_PATTERN.test(name))
      throw new TypeError(`Invalid endpoint name (${name})`);
    this.name = name;
    this.description = init.description;
    this.parameters = [];
    this.responses = [];
    if (init.responses) {
      for (const p of init.responses) {
        this.defineResponse(p);
      }
    }
    if (init.parameters) {
      for (const p of init.parameters) {
        this.defineParameter(p);
      }
    }
  }

  getFullPath(documentPath?: boolean): string {
    return this.parent.getFullPath(documentPath) +
        (documentPath
                ? '/endpoints/' + this.name
                : (this.kind === OpraSchema.Action.Kind ? this.name : '')
        );
  }

  defineResponse(init: ApiResponse.InitArguments): ApiResponse {
    const r = new ApiResponse(this, init);
    this.responses.push(r);
    return r;
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

  getParameter(name: string, location?: OpraSchema.Parameter.Location): ApiParameter | undefined {
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

  exportSchema(): OpraSchema.Endpoint {
    const schema = omitUndefined<OpraSchema.Endpoint>({
      kind: this.kind,
      description: this.description
    });
    if (this.parameters.length) {
      let i = 0;
      const parameters: OpraSchema.Parameter[] = [];
      for (const prm of this.parameters) {
        if (!prm.isBuiltin) {
          parameters.push(prm.exportSchema());
          i++;
        }
      }
      if (i)
        schema.parameters = parameters;
    }
    if (this.responses.length)
      schema.responses = this.responses.map(x => x.exportSchema());
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
