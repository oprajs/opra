import { ApiField, ComplexType } from '@opra/common';

@ComplexType({
  description: 'Phone number information',
})
export class PhoneNumber {
  @ApiField()
  declare countryCode: string;

  @ApiField()
  declare areaCode: string;

  @ApiField()
  declare phoneNumber: string;
}
