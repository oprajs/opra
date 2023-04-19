import { ComplexField, ComplexType } from '@opra/common';

@ComplexType()
export class Photos {

  @ComplexField()
  id: number;

  @ComplexField()
  name: string;

  @ComplexField()
  description: string;

  @ComplexField()
  views: number;
}
