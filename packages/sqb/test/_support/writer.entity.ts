import { ApiEntityType, ApiProperty } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';

@ApiEntityType()
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
