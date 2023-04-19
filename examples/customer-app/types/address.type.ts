import { ApiField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';

@ComplexType({
  description: 'Address information'
})
export class Address {

  @ApiField({
    description: 'Address code'
  })
  @Column()
  code: number;

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
  @Column()
  zipCode: string;

}
