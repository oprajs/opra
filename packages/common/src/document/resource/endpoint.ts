import { StrictOmit, Type } from 'ts-gems';
import type { ErrorIssue } from 'valgen/typings/core/types';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { URLSearchParamsInit } from '../../types.js';
import { DataType } from '../data-type/data-type.js';
import { ApiParameter } from './api-parameter.js';
import type { Resource } from './resource.js';


export namespace Endpoint {
  export interface InitArguments extends StrictOmit<OpraSchema.Endpoint, 'parameters'> {
    parameters?: DefineParameterArgs[];
  }

  export type DefineParameterArgs = StrictOmit<ApiParameter.InitArguments, 'type'> &
      {
        type?: DataType | string | Type
      }
}


/**
 *
 * @class Endpoint
 */
export abstract class Endpoint {
  abstract readonly kind: 'action' | 'operation';
  description?: string;
  headers: ApiParameter[];
  parameters: ApiParameter[];
  options: any = {};

  protected constructor(readonly resource: Resource, readonly name: string, init: Endpoint.InitArguments) {
    Object.assign(this, init);
    this.headers = [];
    this.parameters = [];
    if (init.parameters) {
      for (const p of init.parameters) {
        this.defineParameter(p.name, p);
      }
    }
  }

  getFullPath(documentPath?: boolean): string {
    return this.resource.getFullPath(documentPath) +
        (this.kind === 'action' ? (documentPath ? '/actions/' : '/') + this.name : '')
  }

  defineHeader(name: string | RegExp, init: Omit<Endpoint.DefineParameterArgs, 'name'>): ApiParameter {
    const type = init.type && init.type instanceof DataType
        ? init.type : this.resource.document.getDataType(init.type || 'any');
    const prm = new ApiParameter({
      ...init,
      name,
      type
    });
    this.headers.push(prm);
    return prm;
  }

  defineParameter(name: string | RegExp, init: Omit<Endpoint.DefineParameterArgs, 'name'>): ApiParameter {
    const type = init.type && init.type instanceof DataType
        ? init.type : this.resource.document.getDataType(init.type || 'any');
    const prm = new ApiParameter({
      ...init,
      name,
      type
    });
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
    const schema = omitUndefined<OpraSchema.Action>({
      description: this.description
    });
    if (Object.keys(this.options).length)
      schema.options = {...this.options};
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
