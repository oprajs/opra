import { OprEntity, OprField } from '../../../src/index.js';
import { Record } from './record.entity.js';

@OprEntity({
  description: 'Country information',
  primaryKey: 'code'
})
export class Country extends Record {

  @OprField()
  code: string;

  @OprField()
  name: string;

  @OprField()
  phoneCode: string;

}
