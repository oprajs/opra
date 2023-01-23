import { ErrorListener, RecognitionException } from '@browsery/antlr4';
import { Recognizer } from '@browsery/antlr4/typings/Recognizer';
import { FilterParseError } from './errors.js';

export class OpraErrorListener extends ErrorListener<any> {

  constructor(public errors: FilterParseError[]) {
    super();
  }

  syntaxError(
      recognizer: Recognizer<any>,
      offendingSymbol: any,
      line: number,
      column: number,
      msg: string,
      e: RecognitionException,
  ): void {
    this.errors.push(new FilterParseError(msg, {recognizer, offendingSymbol, line, column, e}));
  }

}
