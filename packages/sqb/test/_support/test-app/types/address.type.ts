import { ApiField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';

@ComplexType({
  description: 'Address information',
})
export class Address {
  @ApiField()
  @Column()
  city: string;

  @ApiField()
  @Column()
  countryCode: string;

  @ApiField()
  @Column()
  street: string;

  @ApiField()
  @Column()
  zipCode: string;
}
