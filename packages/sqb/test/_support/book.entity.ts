import { OprEntity, OprField } from '@opra/schema';
import { Column, Entity, Link, PrimaryKey } from '@sqb/connect';
import { Writer } from './writer.entity.js';

@OprEntity()
@Entity('books')
export class Book {

  @PrimaryKey()
  @Column()
  @OprField({type: 'integer'})
  id: number;

  @Column()
  @OprField()
  name: string;

  @Column()
  @OprField()
  totalPages: number;

  @Column()
  @OprField()
  writerId: number;

  @Link()
  @OprField()
  writer: Writer;

}
