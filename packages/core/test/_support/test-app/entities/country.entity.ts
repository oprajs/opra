import { OprEntity, OprField } from '@opra/schema';

@OprEntity({
  description: 'Country information',
  primaryKey: 'code'
})
export class Country {

  @OprField()
  code: string;

  @OprField()
  name: string;

  @OprField()
  phoneCode?: string;

}
