import { ComplexType, Expose } from '@opra/common';

@ComplexType()
export class Cat {

  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  age: number;
}
