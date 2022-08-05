import { ComplexType } from '../../data-type/complex-type';
import { ExecutionQuery } from '../../execution-query';
import { stringPathToObjectTree } from './string-path-to-object-tree';

export function generateProjection(
    query: ExecutionQuery,
    elements?: string[],
    exclude?: string[],
    include?: string[]
): void {
  const _elementsTree = elements && stringPathToObjectTree(elements);
  const _excludeTree = exclude && stringPathToObjectTree(exclude);
  const _includeTree = include && stringPathToObjectTree(include);
  processNode(query, '', _elementsTree, _includeTree, _excludeTree);
}

function processNode(
    node: ExecutionQuery,
    parentPath: string,
    elementsTree?: object,
    includeTree?: object,
    excludeTree?: object,
): void {
  const dataType = node.resultType;
  /* istanbul ignore next */
  if (!(dataType instanceof ComplexType))
    throw new TypeError(`${dataType?.name} is not a ComplexType`);

  let treeNode = elementsTree;
  if (!treeNode) {
    if (dataType.properties)
      treeNode = stringPathToObjectTree(Object.keys(dataType.properties)) as object;
    else return;
  }
  elementsTree = elementsTree || {};
  includeTree = includeTree || {};
  excludeTree = excludeTree || {};

  for (const k of Object.keys(treeNode)) {
    if (excludeTree?.[k])
      continue;

    const prop = dataType.properties?.[k];
    if (!prop) {
      if (dataType.additionalProperties) {
        node.projection = node.projection || {};
        node.projection[k] = node.projection[k] || true;
        continue;
      }
      throw new Error(`"${dataType.name}" type has no property named "${k}"`);
    }

    if (prop.exclusive && !(elementsTree[k] || includeTree[k]))
      continue;

    const propType = node.service.getDataType(prop.type || 'string');
    const fullPath = (parentPath ? parentPath + '.' : '') + k;
    if (typeof treeNode[k] === 'object' && !(propType instanceof ComplexType))
      throw new TypeError(`"${fullPath}" is not a ComplexType and have no properties`);
    if (propType instanceof ComplexType) {
      const subNode = new ExecutionQuery({
        service: node.service,
        resource: node.resource,
        operation: node.operation,
        collection: !!prop.isArray,
        resultType: propType,
        path: prop.name,
        fullPath
      });
      node.projection = node.projection || {};
      node.projection[k] = subNode;
      processNode(subNode, fullPath,
          typeof elementsTree[k] === 'object' ? elementsTree[k] : undefined,
          typeof excludeTree[k] === 'object' ? excludeTree?.[k] : undefined,
      );
    } else {
      node.projection = node.projection || {};
      node.projection[k] = node.projection[k] || true;
    }
  }
}

