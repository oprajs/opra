import { OprComplexType, OprField } from '../../../src/index.js';
import { Record } from './record.entity.js';

@OprComplexType({
  description: 'Country information'
})
export class Country extends Record {

  @OprField()
  code: string;

  @OprField()
  name: string;

  @OprField()
  phoneCode: string;

}
