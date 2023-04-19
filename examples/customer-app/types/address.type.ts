import { ComplexField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';

@ComplexType({
  description: 'Address information'
})
export class Address {

  @ComplexField({
    description: 'Address code'
  })
  @Column()
  code: number;

  @ComplexField({
    description: 'City name'
  })
  @Column()
  city: string;

  @ComplexField({
    description: 'Street information'
  })
  @Column()
  street: string;

  @ComplexField({
    description: 'ZIP code'
  })
  @Column()
  zipCode: string;

}
