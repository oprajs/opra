import { Combine, StrictOmit } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { HttpMediaType } from './http-media-type.js';
import { HttpOperation } from './http-operation.js';
import type { HttpParameter } from './http-parameter.js';
import { HttpStatusRange } from './http-status-range.js';

/**
 * @namespace HttpOperationResponse
 */
export namespace HttpOperationResponse {
  export interface Metadata
    extends Combine<
      {
        statusCode: number | string | (number | string)[];
        parameters?: HttpParameter.Metadata[];
        partial?: boolean | 'deep';
      },
      HttpMediaType.Metadata
    > {}

  export interface Options extends HttpMediaType.Options {
    partial?: boolean | 'deep';
  }

  export interface InitArguments
    extends Combine<
      {
        statusCode:
          | number
          | string
          | HttpStatusRange
          | OpraSchema.HttpStatusRange
          | (number | string | HttpStatusRange | OpraSchema.HttpStatusRange)[];
      },
      HttpMediaType.InitArguments,
      StrictOmit<Metadata, 'multipartFields'>
    > {}
}

/**
 * @class HttpOperationResponse
 */
export class HttpOperationResponse extends HttpMediaType {
  declare readonly owner: HttpOperation;
  statusCode: HttpStatusRange[];
  parameters: HttpParameter[];
  partial?: boolean | 'deep';

  constructor(owner: HttpOperation, init: HttpOperationResponse.InitArguments) {
    super(owner, init);
    this.parameters = [];
    this.statusCode = (Array.isArray(init.statusCode) ? init.statusCode : [init.statusCode]).map(x =>
      typeof x === 'object' ? new HttpStatusRange(x.start, x.end) : new HttpStatusRange(x as any),
    );
    this.partial = init.partial;
  }

  findParameter(paramName: string, location?: OpraSchema.HttpParameterLocation): HttpParameter | undefined {
    paramName = paramName.toLowerCase();
    for (const prm of this.parameters) {
      if (
        (!location || location === prm.location) &&
        ((prm.name instanceof RegExp && prm.name.test(paramName)) || prm.name === paramName)
      ) {
        return prm;
      }
    }
  }

  toJSON(): OpraSchema.HttpOperationResponse {
    const statusCode = this.statusCode.map(x => x.toJSON());
    const out = omitUndefined<OpraSchema.HttpOperationResponse>({
      ...super.toJSON(),
      statusCode: statusCode.length === 1 && typeof statusCode[0] === 'number' ? statusCode[0] : statusCode,
      partial: this.partial,
    });
    if (this.parameters.length) {
      out.parameters = [];
      for (const prm of this.parameters) {
        out.parameters.push(prm.toJSON());
      }
    }
    return out;
  }
}
