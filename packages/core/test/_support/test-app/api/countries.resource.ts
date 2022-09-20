import { OpraSchema } from '@opra/schema';
import { QueryContext } from '../../../../src/index.js';
import countriesData from '../data/countries.data.js';

export const countriesResource: OpraSchema.EntityResource = {
  kind: 'EntityResource',
  name: 'Countries',
  type: 'Country',

  search: (ctx: QueryContext) => {
    // eslint-disable-next-line no-console
    console.log(ctx);
    return countriesData;
  },

  get: (ctx: QueryContext) => {
    // eslint-disable-next-line no-console
    console.log(ctx);
    return countriesData;
  }

}

