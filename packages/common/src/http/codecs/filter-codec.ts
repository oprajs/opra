import { Ast, Expression } from '../../filter/ast/index.js';
import { OpraFilter } from '../../filter/index.js';
import type { HttpParams } from '../http-params.js';

export class FilterCodec implements HttpParams.Codec {

  decode(value: string | Expression): object {
    if (value instanceof Expression)
      return value;
    return OpraFilter.parse(value);
  }

  encode(value: Ast): string {
    // @ts-ignore
    return value ? '' + value : '';
  }

}
