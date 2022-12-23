import { OpraSchema } from '../../../../src/index.js';

export const countriesResource: OpraSchema.CollectionResource = {
  kind: 'CollectionResource',
  name: 'Countries',
  type: 'Country',
  keyFields: 'id',
  search: {
    handler: () => {
      //
    },
  },
  get: {
    handler: () => {
      //
    }
  }

}

