import {Ast} from '../filter/ast';
import {parseFilter} from '../filter/parse';
import {Format} from './format';

export class FilterFormat extends Format {

  parse(value: string): object {
    return parseFilter(value);
  }

  stringify(value: Ast): string {
    // @ts-ignore
    return value ? '' + value : '';
  }

}
