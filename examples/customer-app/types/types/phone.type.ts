import { ApiField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';

@ComplexType({
  description: 'Phone number information'
})
export class PhoneNumber {

  @ApiField()
  @Column({fieldName: 'area_code'})
  areaCode: number;

  @ApiField()
  @Column({fieldName: 'phone_number'})
  phoneNumber: string;

}
