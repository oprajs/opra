import { KeyValue } from '@opra/core';
import { EntityType } from '@opra/core/src/implementation/data-type/entity-type.js';
import { Expression } from '@opra/url';
import * as sqb from '@sqb/builder';

export function covertKey(dataType: EntityType, key: KeyValue): any {
  if (key && typeof key === 'object') {
    throw new TypeError(`Multi-key indexes is not implemented yet`);
  }
  return sqb.Eq(sqb.Field(dataType.primaryKey), key);
}
