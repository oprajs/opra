import { splitString } from 'fast-tokenizer';

const anythingEnclosedInParenthesesRegex = /\((.+)\)/;

export function getNumberOfArguments(fn: Function): number | undefined {
  const functionAsString = fn.toString();
  const parametersEnclosedInParentheses = functionAsString.match(anythingEnclosedInParenthesesRegex);
  if (parametersEnclosedInParentheses) {
    const matchString = parametersEnclosedInParentheses[1];
    const argumentsArray = splitString(matchString, {
      brackets: {
        '(': ')',
        '{': '}',
        '[': ']',
        '/*': '*/'
      }, delimiters: ','
    });
    return argumentsArray.length;
  }
  return 0;
}
