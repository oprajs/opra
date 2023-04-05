import { Ast, Expression } from '../../filter/ast/index.js';
import { parseFilter } from '../../filter/parse.js';
import type {HttpParams} from '../http-params.js';

export class FilterCodec implements HttpParams.Codec {

  decode(value: string | Expression): object {
    if (value instanceof Expression)
      return value;
    return parseFilter(value);
  }

  encode(value: Ast): string {
    // @ts-ignore
    return value ? '' + value : '';
  }

}
