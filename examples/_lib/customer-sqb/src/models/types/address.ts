import { ApiField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';
import { Record } from './record.js';

@ComplexType({
  description: 'Address information',
})
export class Address extends Record {
  @ApiField()
  @Column()
  declare city: string;

  @ApiField()
  @Column()
  declare countryCode: string;

  @ApiField()
  @Column()
  declare street: string;

  @ApiField()
  @Column()
  declare zipCode: string;
}
