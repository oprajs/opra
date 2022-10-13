import { OprComplexType, OprField } from '../../../src/index.js';

@OprComplexType({
  abstract: true,
  description: 'Customer information'
})
export class Record {

  @OprField({type: 'integer'})
  id: number;

  @OprField()
  deleted?: boolean;

}
