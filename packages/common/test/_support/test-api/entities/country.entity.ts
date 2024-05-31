import { ApiField, ComplexType } from '@opra/common';

@ComplexType({
  description: 'Country information',
  keyField: 'code',
})
export class Country {
  @ApiField()
  code: string;

  @ApiField()
  name: string;

  @ApiField()
  phoneCode?: string;
}
