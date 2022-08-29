import { OpraSchema } from '@opra/common';
import { ExecutionContext } from '../../../src/index.js';
import countriesData from '../data/countries.data.js';

export const countriesResource: OpraSchema.EntityResource = {
  kind: 'EntityResource',
  name: 'Countries',
  type: 'Country',
  primaryKey: 'code',
  read: {
    handler: (ctx: ExecutionContext) => {
      // eslint-disable-next-line no-console
      console.log(ctx);
      return countriesData;
    }
  },
  search: {
    sortPaths: ['id'],
    defaultSortPaths: ['id'],
    handler: (ctx: ExecutionContext) => {
      // eslint-disable-next-line no-console
      console.log(ctx);
      return countriesData;
    }
  }

}

