import { ApiDocumentFactory, Container } from '@opra/common';
import { EntityMetadata } from '@sqb/connect';

// @ts-ignore
const _createResource = ApiDocumentFactory.prototype.createResource;
// @ts-ignore
ApiDocumentFactory.prototype.createResource = function (
    this: ApiDocumentFactory,
    container: Container,
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
  return _createResource.call(this, container, initArguments);
}
