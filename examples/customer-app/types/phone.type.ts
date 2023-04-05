import { ComplexType, Expose } from '@opra/common';
import { Column } from '@sqb/connect';

@ComplexType({
  description: 'Phone number information'
})
export class PhoneNumber {

  @Expose()
  @Column({fieldName: 'area_code'})
  areaCode: number;

  @Expose()
  @Column({fieldName: 'phone_number'})
  phoneNumber: string;

}
