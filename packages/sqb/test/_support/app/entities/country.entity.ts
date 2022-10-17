import { OprComplexType, OprField } from '@opra/schema';
import { Column, Entity, PrimaryKey } from '@sqb/connect';

@OprComplexType()
@Entity('countries')
export class Country {

  @OprField()
  @Column()
  @PrimaryKey()
  code: string;

  @OprField()
  @Column()
  name: string;

  @OprField()
  @Column({fieldName: 'phone_code'})
  phoneCode: string;

  @OprField()
  @Column()
  flag: string;
}
