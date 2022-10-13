import { OprComplexType, OprField } from '@opra/schema';

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
