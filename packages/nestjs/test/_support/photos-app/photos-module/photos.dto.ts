import { ComplexType, Expose } from '@opra/common';

@ComplexType()
export class Photos {

  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  views: number;
}
