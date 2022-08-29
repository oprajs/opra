import {Ast, Expression} from '../filter/ast/index.js';
import {parseFilter} from '../filter/parse.js';
import {Format} from './format.js';

export class FilterFormat extends Format {

  parse(value: string | Expression): object {
    if (value instanceof Expression)
      return value;
    return parseFilter(value);
  }

  stringify(value: Ast): string {
    // @ts-ignore
    return value ? '' + value : '';
  }

}
