import { OpraSchema } from '@opra/schema';
import countriesData from '../data/countries.data.js';

export const countriesResource: OpraSchema.EntityResource = {
  kind: 'EntityResource',
  name: 'Countries',
  type: 'Country',
  keyFields: 'code',
  methods: {
    search: {
      handler: () => {
        return countriesData[0];
      },
    },
    get: {
      handler: () => {
        return countriesData;
      }
    }
  }

}

