import { ComplexType, Property } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';

@ComplexType()
@Entity('shelves')
export class Shelf {

  @PrimaryKey()
  @Column()
  @Property({type: 'integer'})
  id: number;

  @Column()
  @Property()
  name: string;

}
