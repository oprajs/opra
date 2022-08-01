import { ComplexType, Property } from '@opra/common';
import { Address } from './address.dto';
import { Person } from './person.dto';

@ComplexType()
export class Customer extends Person {

  @Property({type: 'integer'})
  id: number;

  @Property()
  cid: string;

  @Property()
  identity: string;

  @Property()
  city: string;

  @Property()
  countryCode: string;

  @Property()
  active: boolean;

  @Property({type: 'integer'})
  vip: number;

  @Property()
  address?: Address;

}
