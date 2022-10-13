import { OprComplexType, OprField } from '@opra/schema';
import { Column, Entity, PrimaryKey } from '@sqb/connect';

@OprComplexType()
@Entity('writers')
export class Writer {

  @PrimaryKey()
  @Column()
  @OprField({type: 'integer'})
  id: number;

  @Column()
  @OprField()
  name: string;

}
