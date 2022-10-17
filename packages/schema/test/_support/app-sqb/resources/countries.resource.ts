import { OpraSchema } from '../../../../src/index.js';

export const countriesResource: OpraSchema.EntityResource = {
  kind: 'EntityResource',
  name: 'Countries',
  type: 'Country',
  keyFields: 'id',
  methods: {
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


}

