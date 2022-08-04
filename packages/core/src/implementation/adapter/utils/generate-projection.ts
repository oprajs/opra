import { ComplexType } from '../../data-type/complex-type';
import { ExecutionQuery } from '../../execution-query';

export function generateProjection(
    query: ExecutionQuery,
    elements: string[] | undefined,
    exclude: string[] | undefined,
    include: string[] | undefined
): void {
  const dataType = query.resultType;
  /* istanbul ignore next */
  if (!(dataType instanceof ComplexType))
    throw new TypeError(`${dataType?.name} is not a ComplexType`);
  const properties = dataType.properties && Object.keys(dataType.properties);
  let _elementsTree = elements && stringPathToObj(elements);
  if (!_elementsTree) {
    if (properties)
      _elementsTree = stringPathToObj(Object.keys(properties)) as object;
    else return;
  }
  const _excludeTree = exclude && stringPathToObj(exclude);
  const _includeTree = include && stringPathToObj(include);
  processNode(query, '', dataType, _elementsTree, _excludeTree);
  if (_includeTree)
    processNode(query, '', dataType, _includeTree, _excludeTree);
}

function processNode(
    node: ExecutionQuery,
    fullPath: string,
    dt: ComplexType,
    elementsTree: object,
    excludeTree?: object,
): void {
  for (const k of Object.keys(elementsTree)) {
    if (excludeTree?.[k])
      continue;

    const prop = dt.properties?.[k];
    if (!prop) {
      if (dt.additionalProperties) {
        node.projection = node.projection || {};
        node.projection[k] = true;
        continue;
      }
      throw new Error(`"${dt.name}" type has no property named "${k}"`);
    }

    const treeElement = elementsTree[k];

    if (typeof treeElement !== 'object') {
      node.projection = node.projection || {};
      node.projection[k] = true;
      continue;
    }

    const propType = node.service.getDataType(prop.type || 'string');
    const newPath = (fullPath ? fullPath + '.' : '') + k;
    if (!(propType instanceof ComplexType))
      throw new TypeError(`"${newPath}" is not a ComplexType and have no properties`);
    const subNode = new ExecutionQuery({
      service: node.service,
      resource: node.resource,
      operation: node.operation,
      collection: !!prop.isArray,
      resultType: propType,
      path: prop.name,
      fullPath: newPath
    });
    processNode(subNode, newPath, propType, treeElement, excludeTree?.[k]);

  }
}

const dotPattern = /^([^.]+)\.(.*)$/;

function stringPathToObj(arr: string[], out?: object): object | undefined {
  for (const k of arr) {
    const m = dotPattern.exec(k);
    if (m) {
      out = out || {};
      if (out[m[1]] === true)
        continue;
      out[m[1]] = stringPathToObj([m[2]], out[m[1]]);
    } else {
      out = out || {};
      out[k] = true;
    }
  }
  return out;
}
