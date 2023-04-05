import { ObjectTree, pathToObjectTree } from '../../helpers/index.js';
import type { ApiDocument } from '../api-document.js';
import { ComplexType } from '../data-type/complex-type.js';

export function normalizeElementNames(
    document: ApiDocument,
    dataType: ComplexType | undefined,
    fields: string[],
    parentPath: string = '',
) {
  const fieldsTree = pathToObjectTree(fields) || {};
  return _normalizeElementNames([], document, dataType, fieldsTree, '', parentPath,
      {
        additionalFields: true
      });
}

function _normalizeElementNames(
    target: string[],
    document: ApiDocument,
    dataType: ComplexType | undefined,
    node: ObjectTree,
    parentPath: string = '',
    actualPath: string = '',
    options?: {
      additionalFields?: boolean;
    }
): string[] {
  let curPath = '';
  for (const k of Object.keys(node)) {
    const nodeVal = node[k];

    const element = dataType?.elements.get(k);
    if (!element) {
      curPath = parentPath ? parentPath + '.' + k : k;

      if (!options?.additionalFields || (dataType && !dataType.additionalElements))
        throw new TypeError(`Unknown element "${curPath}"`);
      if (typeof nodeVal === 'object')
        _normalizeElementNames(target, document, undefined, nodeVal, curPath, actualPath, options);
      else target.push(curPath);
      continue;
    }
    curPath = parentPath ? parentPath + '.' + element.name : element.name;

    if (typeof nodeVal === 'object') {
      if (!(element.type instanceof ComplexType))
        throw new TypeError(`"${(actualPath ? actualPath + '.' + curPath : curPath)}" is not a complex type and has no sub fields`);
      if (target.findIndex(x => x === parentPath) >= 0)
        continue;

      target = _normalizeElementNames(target, document, element.type, nodeVal, curPath, actualPath, options);
      continue;
    }

    if (target.findIndex(x => x.startsWith(curPath + '.')) >= 0) {
      target = target.filter(x => !x.startsWith(curPath + '.'));
    }

    target.push(curPath);
  }
  return target;
}
