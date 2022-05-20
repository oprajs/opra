import {Ast} from '../filter/ast';
import {parseFilter} from '../filter/parse';
import {unquoteString} from '../utils/string-utils';
import {Format} from './format';

export class FilterFormat extends Format {

  parse(value: string): object {
    return parseFilter(unquoteString(value));
  }

  stringify(value: Ast): string {
    // @ts-ignore
    return ast ? '' + value : '';
  }

}
