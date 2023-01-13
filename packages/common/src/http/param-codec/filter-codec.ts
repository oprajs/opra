import { HttpParamCodec } from '../http-param-codec.js';
import { Ast, Expression } from '../../filter/ast/index.js';
import { parseFilter } from '../../filter/parse.js';

export class FilterCodec extends HttpParamCodec {

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
