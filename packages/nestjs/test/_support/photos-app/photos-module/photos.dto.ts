import { OprComplexType, OprField } from '@opra/common';

@OprComplexType()
export class Photos {

  @OprField()
  id: number;

  @OprField()
  name: string;

  @OprField()
  description: string;

  @OprField()
  views: number;
}
