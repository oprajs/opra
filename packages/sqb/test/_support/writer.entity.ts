import { ApiComplexType, ApiProperty } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';

@ApiComplexType()
@Entity('writers')
export class Writer {

  @PrimaryKey()
  @Column()
  @ApiProperty({type: 'integer'})
  id: number;

  @Column()
  @ApiProperty()
  name: string;

}
