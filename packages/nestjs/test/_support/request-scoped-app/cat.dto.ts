import { ComplexField, ComplexType } from '@opra/common';

@ComplexType()
export class Cat {

  @ComplexField()
  id: number;

  @ComplexField()
  name: string;

  @ComplexField()
  age: number;
}
