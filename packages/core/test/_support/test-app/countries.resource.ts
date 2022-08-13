import { OpraSchema } from '@opra/common';
import { ExecutionContext } from '../../../src';
import countriesData from '../data/countries.data';

export const countriesResource: OpraSchema.EntityResource = {
  kind: 'EntityResource',
  name: 'Countries',
  type: 'Country',
  primaryKey: 'code',
  read: {
    handler: (ctx: ExecutionContext) => {
      return countriesData;
      // eslint-disable-next-line no-console
      console.log(ctx);
    }
  },
  search: {
    sortPaths: ['id'],
    defaultSortPaths: ['id'],
    handler: (ctx: ExecutionContext) => {
      return countriesData;
      // eslint-disable-next-line no-console
      console.log(ctx);
    }
  }

}

