import { CollectionResourceInfo } from '../resource/collection-resource-info.js';

export class CollectionDeleteQuery  {
  readonly kind = 'CollectionDeleteQuery';
  readonly method = 'delete'
  readonly operation = 'delete';
  keyValue: any;

  constructor(readonly resource: CollectionResourceInfo,
              keyValue: any
  ) {
    if (resource.keyFields.length > 1) {
      if (typeof keyValue !== 'object')
        throw new Error(`You must provide an key/value object for all key fields (${resource.keyFields})`);
      resource.keyFields.reduce((o, k) => {
        o[k] = keyValue[k];
        return o;
      }, {});
    } else
      this.keyValue = resource.dataType.getFieldType(resource.keyFields[0]).parse(keyValue);
  }

  get dataType() {
    return this.resource.dataType;
  }
}
