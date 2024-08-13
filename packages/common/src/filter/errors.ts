import { Recognizer } from '@browsery/antlr4';

export class SyntaxError extends TypeError {}

export class FilterValidationError extends TypeError {
  constructor(message?: string | { message?: string }) {
    super(typeof message === 'string' ? message : message?.message);
    if (typeof message === 'object') Object.assign(this, message);
  }
}

export class FilterParseError extends Error {
  declare recognizer: Recognizer<any>;
  declare offendingSymbol?: any;
  declare line: number;
  declare column: number;
  declare e: Error | undefined;

  constructor(
    message: string,
    args: {
      recognizer: Recognizer<any>;
      offendingSymbol?: any;
      line: number;
      column: number;
      e: Error | undefined;
    },
  ) {
    super(message);
    Object.assign(this, args);
  }
}
