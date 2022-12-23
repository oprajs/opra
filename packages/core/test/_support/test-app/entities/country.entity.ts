import { OprComplexType, OprField } from '@opra/common';

@OprComplexType({
  description: 'Country information'
})
export class Country {

  @OprField()
  code: string;

  @OprField()
  name: string;

  @OprField()
  phoneCode?: string;

}
