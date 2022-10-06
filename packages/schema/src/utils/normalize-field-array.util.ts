import { ComplexType } from '../implementation/data-type/complex-type.js';
import { EntityType } from '../implementation/data-type/entity-type.js';
import { OpraDocument } from '../implementation/opra-document.js';
import { ObjectTree, pathToTree } from './path-to-tree.js';

export function normalizeFieldArray(
    document: OpraDocument,
    dataType: ComplexType | EntityType | undefined,
    fields: string[],
    parentPath: string = '',
) {
  const fieldsTree = pathToTree(fields) || {};
  return _normalizeFieldsList([], document, dataType, fieldsTree, '', parentPath,
      {
        additionalFields: true
      });
}

function _normalizeFieldsList(
    target: string[],
    document: OpraDocument,
    dataType: ComplexType | EntityType | undefined,
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

    const prop = dataType?.fields.get(k);
    if (!prop) {
      curPath = parentPath ? parentPath + '.' + k : k;

      if (!options?.additionalFields || (dataType && !dataType.additionalFields))
        throw new TypeError(`Unknown field "${curPath}"`);
      if (typeof nodeVal === 'object')
        _normalizeFieldsList(target, document, undefined, nodeVal, curPath, actualPath, options);
      else target.push(curPath);
      continue;
    }
    curPath = parentPath ? parentPath + '.' + prop.name : prop.name;

    const propType = document.getDataType(prop.type || 'string');

    if (typeof nodeVal === 'object') {
      if (!(propType && propType instanceof ComplexType))
        throw new TypeError(`"${(actualPath ? actualPath + '.' + curPath : curPath)}" is not a complex type and has no sub fields`);
      if (target.findIndex(x => x === parentPath) >= 0)
        continue;

      target = _normalizeFieldsList(target, document, propType, nodeVal, curPath, actualPath, options);
      continue;
    }

    if (target.findIndex(x => x.startsWith(curPath + '.')) >= 0) {
      target = target.filter(x => !x.startsWith(curPath + '.'));
    }

    target.push(curPath);
  }
  return target;
}
