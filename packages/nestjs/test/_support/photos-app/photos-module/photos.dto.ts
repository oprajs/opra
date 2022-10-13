import { OprComplexType, OprField } from '@opra/schema';

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
