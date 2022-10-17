import { OpraSchema } from '@opra/schema';
import countriesData from '../data/countries.data.js';

export const countriesResource: OpraSchema.CollectionResource = {
  kind: 'CollectionResource',
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

