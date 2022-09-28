import { OpraSchema } from '../../../src/index.js';

export const countriesResource: OpraSchema.EntityResource = {
  kind: 'EntityResource',
  name: 'Countries',
  type: 'Country',
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

