import { ApiField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';

@ComplexType({
  description: 'Address information'
})
export class Address {

  @ApiField({
    description: 'Country code'
  })
  @Column({fieldName: 'country_code'})
  countryCode: string;

  @ApiField({
    description: 'City name'
  })
  @Column()
  city: string;

  @ApiField({
    description: 'Street information'
  })
  @Column()
  street: string;

  @ApiField({
    description: 'ZIP code'
  })
  @Column({fieldName: 'zip_code'})
  zipCode: string;

}
