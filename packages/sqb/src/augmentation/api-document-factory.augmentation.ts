import { ApiDocumentFactory } from '@opra/common';
import { EntityMetadata } from '@sqb/connect';

// @ts-ignore
const _addResource = ApiDocumentFactory.prototype.addResource;
// @ts-ignore
ApiDocumentFactory.prototype.addResource = async function (
    this: ApiDocumentFactory,
    initArguments: ApiDocumentFactory.ResourceInitializer
) {
  // Determine primaryKey if not defined
  if (initArguments.kind === 'Collection' && !initArguments.primaryKey && initArguments.type.ctor) {
    const entityMetadata = EntityMetadata.get(initArguments.type.ctor);
    if (entityMetadata?.indexes) {
      const primaryIndex = entityMetadata.indexes.find(x => x.primary);
      if (primaryIndex) {
        initArguments.primaryKey = primaryIndex.columns;
      }
    }
  }
  return await _addResource.call(this, initArguments);
}
