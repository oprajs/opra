import { OpraSchema } from '@opra/common';

export const customerResource: OpraSchema.EntityResource = {
  kind: 'EntityResource',
  name: 'Customer',
  type: 'Customer',
  primaryKey: 'id',
  sortFields: ['id'],
  read: {
    handle: (ctx) => {
      // eslint-disable-next-line no-console
      console.log(ctx);
    }
  }
}

