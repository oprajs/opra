import { RecognitionException } from '@browsery/antlr4';
import { Recognizer } from '@browsery/antlr4/typings/Recognizer';

export class SyntaxError extends TypeError {
}

export class ValidationError extends TypeError {

}

export class FilterParseError extends Error {
  recognizer: Recognizer<any>;
  offendingSymbol: any | undefined;
  line: number;
  column: number;
  e: RecognitionException | undefined;

  constructor(message: string, args: {
    recognizer: Recognizer<any>;
    offendingSymbol: any | undefined;
    line: number;
    column: number;
    e: RecognitionException | undefined;
  }) {
    super(message);
    Object.assign(this, args);
  }
}
