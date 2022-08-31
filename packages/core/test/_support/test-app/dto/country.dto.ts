import { ComplexType, Property } from '@opra/common';

@ComplexType({
  description: 'Country information'
})
export class Country {

  @Property()
  code: string;

  @Property()
  name: string;

  @Property()
  phoneCode: string;

}
