import { MixinType, OprComplexType, OprField } from '../../../src/index.js';
import { Address } from '../types/address.dto.js';
import { Note } from '../types/note.type.js';
import { Person } from '../types/person.type.js';
import { Record } from './record.entity.js';

@OprComplexType({
  description: 'Customer information'
})
export class Customer extends MixinType(Record, Person) {

  @OprField()
  cid: string;

  @OprField()
  identity: string;

  @OprField()
  city: string;

  @OprField()
  countryCode: string;

  @OprField()
  active: boolean;

  @OprField({type: 'integer'})
  vip: number;

  @OprField({
    exclusive: true
  })
  address?: Address;

  @OprField({
    exclusive: true
  })
  notes?: Note;

}
