import {
  Collection,
  DataType,
  ForbiddenError,
  OpraSchema,
  Singleton,
  translate
} from '@opra/common';
import { QueryRequestContext } from '../request-context/query-request-context.js';
import { QueryBase } from './query-base.js';

export abstract class EntityQuery extends QueryBase {
  readonly type: DataType;

  protected constructor(readonly resource: Collection | Singleton) {
    super(resource);
    this.type = this.resource.type;
  }

  protected override async _execute(context: QueryRequestContext): Promise<any> {
    const method = context.query.method;
    const operation = this.resource.operations[method] as OpraSchema.Endpoint;
    if (!operation?.handler)
      throw new ForbiddenError({
        message: translate('RESOLVER_FORBIDDEN', {method},
            `The resource endpoint does not accept '{{method}}' operations`),
        severity: 'error',
        code: 'RESOLVER_FORBIDDEN'
      });
    return operation.handler(context, this);
  }

}

export function parseKeyValue(resource: Collection, v: any): any {
  if (resource.primaryKey.length > 1) {
    if (typeof v !== 'object')
      throw new Error(`You must provide an key/value object for all primary key elements (${resource.primaryKey})`);
    return resource.primaryKey.reduce((o, k) => {
      o[k] = resource.type.getElement(k).type.coerce(v[k]);
      return o;
    }, {});
  }
  return resource.type.getElement(resource.primaryKey[0])
      .type.coerce(v);
}

export function parseAffected(v: any): number {
  if (typeof v === 'number')
    return v;
  if (typeof v === 'boolean')
    return v ? 1 : 0;
  if (typeof v === 'object')
    return v.affectedRows || v.affected;
  return 0;
}
