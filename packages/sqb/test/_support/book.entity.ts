import { ApiEntity, ApiProperty } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';
import { Writer } from './writer.entity.js';

@ApiEntity()
@Entity('books')
export class Book {

  @PrimaryKey()
  @Column()
  @ApiProperty({type: 'integer'})
  id: number;

  @Column()
  @ApiProperty()
  name: string;

  @Column()
  @ApiProperty()
  totalPages: number;

  @Column()
  @ApiProperty()
  writerId: number;

  @Column()
  @ApiProperty()
  writer: Writer;

}
