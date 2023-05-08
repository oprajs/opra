// import {
//   ArrayExpression, Ast,
//   BooleanLiteral,
//   ComparisonExpression, DateLiteral,
//   Expression, LogicalExpression, NullLiteral,
//   NumberLiteral, ParenthesesExpression, parseFilter,
//   QualifiedIdentifier,
//   StringLiteral, TimeLiteral
// } from '@opra/common';
// import '@opra/core';
//
// export default function transformFilter(str: string | Expression | undefined): any {
//   const ast = typeof str === 'string' ? parseFilter(str) : str;
//   if (!ast)
//     return;
//
//   return {query: _transformAst(ast)};
//
// //   if (ast instanceof ArrayExpression) {
// //     return ast.items.map(_transformAst);
// //   }
// //
// //
// //   if (ast instanceof ParenthesesExpression) {
// //     return _transformAst(ast.expression);
// //   }
// //
//
// }
//
//
// function _transformAst(ast: Expression): any {
//   if (ast instanceof LogicalExpression) {
//     return {
//       bool: {
//         [ast.op === 'and' ? 'must' : 'should']:
//             ast.items.map(item => _transformAst(item))
//       }
//     }
//   }
//
//   if (ast instanceof QualifiedIdentifier) {
//     return ast.value;
//   }
//
//   if (ast instanceof NumberLiteral ||
//       ast instanceof StringLiteral ||
//       ast instanceof BooleanLiteral ||
//       ast instanceof NullLiteral ||
//       ast instanceof DateLiteral ||
//       ast instanceof TimeLiteral
//   ) {
//     return ast.value;
//   }
//
//   if (ast instanceof ComparisonExpression)
//     return _transformComparisonExpression(ast);
//
//   throw new Error(`${ast.kind} is not implemented yet`);
// }
//
// function _transformComparisonExpression(ast: ComparisonExpression): any {
//   const left = ast.left instanceof QualifiedIdentifier
//       ? ast.left.value
//       : _transformAst(ast.left);
//   const right = _transformAst(ast.right);
//   (ast.left as QualifiedIdentifier).
//
//   if (right == null) {
//     switch (ast.op) {
//       case '=':
//         return {
//           'bool': {
//             'must_not': {
//               'exists': {
//                 'field': left
//               }
//             }
//           }
//         }
//       case '!=':
//         return {
//           'bool': {
//             'exists': {
//               'field': left
//             }
//           }
//         }
//     }
//     throw new Error(`Only [=, !=] operators supported for null comparison`);
//   }
//
//   // if (!(typeof right === 'string' || typeof right === 'number'))
//   //   throw new Error(`Comparison expression does not support this type of (${typeof right}) value`);
//
//   const t = typeof right;
//
//   if (t === 'string' || t === 'number' || t === 'boolean') {
//     switch (ast.op) {
//       case '=': {
//         return {'term': {[left]: right}};
//       }
//       case '!=':
//         return {
//           'bool': {
//             'must_not': {
//               'term': {[left]: right}
//             }
//           }
//         };
//     }
//   }
//
//   switch (ast.op) {
//
//     case '>':
//       return {
//         'range': {
//           [left]: {'gt': right}
//         }
//       };
//     case '>=':
//       return {
//         'range': {
//           [left]: {'gte': right}
//         }
//       };
//     case '<':
//       return {
//         'range': {
//           [left]: {'lt': right}
//         }
//       };
//     case '<=':
//       return {
//         'range': {
//           [left]: {'lte': right}
//         }
//       };
//     case 'in':
//       return {
//         'terms': {
//           [left]: Array.isArray(right) ? right : [right]
//         }
//       };
//     case '!in':
//       return {
//         'bool': {
//           'must_not': {
//             'terms': {
//               [left]: Array.isArray(right) ? right : [right]
//             }
//           }
//         }
//       };
//     case 'like':
//       return {
//         'wildcard': {
//           [left]: String(right).replace(/\\%/, '*'),
//         }
//       };
//     case 'ilike':
//       return {
//         'wildcard': {
//           [left]: {
//             'value': String(right).replace(/\\%/, '*'),
//             "case_insensitive": true
//           }
//         }
//       };
//     case '!like':
//       return {
//         'bool': {
//           'must_not': {
//             'wildcard': {
//               [left]: String(right).replace(/\\%/, '*'),
//             }
//           }
//         }
//       };
//     case '!ilike':
//       return {
//         'bool': {
//           'must_not': {
//             'wildcard': {
//               [left]: {
//                 'value': String(right).replace(/\\%/, '*'),
//                 "case_insensitive": true
//               }
//             }
//           }
//         }
//       };
//   }
//   throw new Error(`ComparisonExpression operator (${ast.op}) not implemented yet`);
// }
