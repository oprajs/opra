import { ComplexField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';

@ComplexType({
  description: 'Phone number information'
})
export class PhoneNumber {

  @ComplexField()
  @Column({fieldName: 'area_code'})
  areaCode: number;

  @ComplexField()
  @Column({fieldName: 'phone_number'})
  phoneNumber: string;

}
