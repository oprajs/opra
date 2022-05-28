import {Ast, Expression} from '../filter/ast';
import {parseFilter} from '../filter/parse';
import {Format} from './format';

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
