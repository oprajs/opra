import { ComplexType, Property } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';
import { Shelf } from './shelf.entity.js';

@ComplexType()
@Entity('books')
export class Book {

  @PrimaryKey()
  @Column()
  @Property({type: 'integer'})
  id: number;

  @Column()
  @Property()
  name: string;

  @Column()
  @Property()
  totalPages: number;

  @Column()
  @Property()
  shelfId: number;

  @Column()
  @Property()
  shelf: Shelf;

}
