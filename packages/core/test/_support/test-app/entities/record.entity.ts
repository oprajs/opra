import { OprComplexType, OprField } from '@opra/common';

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
