import type { ParseTreeVisitor } from '@browsery/antlr4';
import { CharStream, CommonTokenStream } from '@browsery/antlr4';
import OpraFilterLexer from './antlr/OpraFilterLexer.js';
import OpraFilterParser from './antlr/OpraFilterParser.js';
import { SyntaxError } from './errors.js';
import { FilterTreeVisitor } from './filter-tree-visitor.js';
import { OpraErrorListener } from './opra-error-listener.js';

export function parse(text: string, visitor?: ParseTreeVisitor<any>) {
  const chars = new CharStream(text);
  const lexer = new OpraFilterLexer(chars);
  const tokenStream = new CommonTokenStream(lexer as any);
  const parser = new OpraFilterParser(tokenStream as any);
  parser.buildParseTrees = true;

  const errors: any[] = [];
  const errorListener = new OpraErrorListener(errors);
  lexer.removeErrorListeners();
  lexer.addErrorListener(errorListener);
  parser.removeErrorListeners();
  parser.addErrorListener(errorListener);
  const tree = parser.root();

  if (errors.length) {
    const errMsgs: any[] = [];
    for (const err of errors) {
      errMsgs.push(
        err.message +
          (text.includes('\n')
            ? ' at ' + 'line: ' + err.line + ' column: ' + err.column
            : ' at ' + ' column: ' + err.column),
      );
    }
    const e = new SyntaxError(errMsgs.join('\n'));
    (e as any).errors = errors;
    throw e;
  }
  visitor = visitor || new FilterTreeVisitor();
  return visitor.visit(tree);
}
