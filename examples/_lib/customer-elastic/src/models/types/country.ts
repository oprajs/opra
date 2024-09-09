import { ApiField, ComplexType } from '@opra/common';

@ComplexType({
  description: 'Country information',
})
export class Country {
  @ApiField()
  declare code: string;

  @ApiField()
  declare name: string;

  @ApiField()
  declare phoneCode?: string;
}
