import { OpraSchema } from '@opra/schema';
import { ExecutionContext } from '../../../../src/index.js';
import countriesData from '../data/countries.data.js';

export const countriesResource: OpraSchema.EntityResource = {
  kind: 'EntityResource',
  name: 'Countries',
  type: 'Country',

  search: (ctx: ExecutionContext) => {
    // eslint-disable-next-line no-console
    console.log(ctx);
    return countriesData;
  },

  read: (ctx: ExecutionContext) => {
    // eslint-disable-next-line no-console
    console.log(ctx);
    return countriesData;

  }

}

