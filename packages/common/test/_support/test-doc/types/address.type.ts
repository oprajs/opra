import { ApiField, ComplexType } from '@opra/common';

@ComplexType({
  description: 'Address information'
})
export class Address {

  @ApiField()
  code: number;

  @ApiField()
  city: string;

  @ApiField()
  street: string;

  @ApiField()
  zipCode: string;

}
