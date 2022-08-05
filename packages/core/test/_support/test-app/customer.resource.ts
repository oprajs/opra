import { OpraSchema } from '@opra/common';
import { ExecutionContext } from '../../../src';

export const customerResource: OpraSchema.EntityResource = {
  kind: 'EntityResource',
  name: 'Customer',
  type: 'Customer',
  primaryKey: 'id',
  sortFields: ['id'],
  read: {
    handle: (ctx: ExecutionContext) => {
      // eslint-disable-next-line no-console
      console.log(ctx);
    }
  }
}

