import {CharStreams, CommonTokenStream} from 'antlr4ts';
import {AbstractParseTreeVisitor} from 'antlr4ts/tree';
import {OWOFilterLexer} from './antlr/OWOFilterLexer';
import {OWOFilterParser,} from './antlr/OWOFilterParser';
import {ErrorListener} from './error-listener';
import {FilterTreeVisitor} from './filter-tree-visitor';

export function parseFilter(text: string, visitor?: AbstractParseTreeVisitor<any>) {
  const inputStream = CharStreams.fromString(text);
  const lexer = new OWOFilterLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new OWOFilterParser(tokenStream);
  parser.buildParseTree = true;

  const errors: any[] = [];
  const errorListener = new ErrorListener(errors);
  lexer.removeErrorListeners();
  lexer.addErrorListener(errorListener);
  parser.removeErrorListeners();
  parser.addErrorListener(errorListener);
  const tree = parser.root();

  visitor = visitor || new FilterTreeVisitor();
  const result = visitor.visit(tree);
  if (errors.length) {
    const errMsgs: any[] = [];
    for (const err of errors) {
      errMsgs.push(err.msg +
        ' at (' + 'line: ' + err.line + ' column: ' + err.charPositionInLine + ')');
    }
    const e = new Error(errMsgs.join('\n'));
    (e as any).errors = errors;
    throw e;
  }
  return result;

}
