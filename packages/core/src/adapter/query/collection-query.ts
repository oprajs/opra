import { Collection } from '@opra/common';
import { EntityQuery } from './entity-query.js';

export abstract class CollectionQuery extends EntityQuery {
  readonly subject = 'Collection';

  protected constructor(readonly resource: Collection) {
    super(resource);
  }

  protected _parseKeyValue(v: any): any {
    const {resource} = this;
    if (resource.primaryKey.length > 1) {
      if (typeof v !== 'object')
        throw new Error(`You must provide an key/value object for all primary key elements (${resource.primaryKey})`);
      return this.resource.primaryKey.reduce((o, k) => {
        o[k] = resource.type.getElement(k).type.coerce(v[k]);
        return o;
      }, {});
    }
    return resource.type.getElement(resource.primaryKey[0])
        .type.coerce(v);
  }

  protected _parseAffected(v: any): number {
    if (typeof v === 'number')
      return v;
    if (typeof v === 'boolean')
      return v ? 1 : 0;
    if (typeof v === 'object')
      return v.affectedRows || v.affected;
    return 0;
  }

}
