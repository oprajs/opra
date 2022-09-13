import { ApiEntityType, ApiProperty } from '@opra/schema';
import { Column, Entity, Link, PrimaryKey } from '@sqb/connect';
import { Writer } from './writer.entity.js';

@ApiEntityType()
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

  @Link()
  @ApiProperty()
  writer: Writer;

}
