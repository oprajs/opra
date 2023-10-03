import { ApiField, ComplexType } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';

@ComplexType({
  description: 'Country information'
})
@Entity({tableName: 'countries'})
export class Country {

  @ApiField()
  @Column({notNull: true})
  @PrimaryKey()
  code: string;

  @ApiField()
  @Column({notNull: true})
  name: string;
}
