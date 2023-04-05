import { ComplexType, Expose } from '@opra/common';
import { Column } from '@sqb/connect';

@ComplexType({
  description: 'Address information'
})
export class Address {

  @Expose({
    description: 'Address code'
  })
  @Column()
  code: number;

  @Expose({
    description: 'City name'
  })
  @Column()
  city: string;

  @Expose({
    description: 'Street information'
  })
  @Column()
  street: string;

  @Expose({
    description: 'ZIP code'
  })
  @Column()
  zipCode: string;

}
