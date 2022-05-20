import {ANTLRErrorListener, Recognizer} from 'antlr4ts';
import {RecognitionException} from 'antlr4ts/RecognitionException';
import {FilterParseError} from '../errors';

export class ErrorListener implements ANTLRErrorListener<any> {

  constructor(public errors: FilterParseError[]) {
  }

  syntaxError<T>(
    recognizer: Recognizer<T, any>,
    offendingSymbol: T | undefined,
    line: number,
    charPositionInLine: number,
    msg: string,
    e: RecognitionException | undefined
  ): void {
    this.errors.push(new FilterParseError(msg, {recognizer, offendingSymbol, line, charPositionInLine, e}));
  }

}
