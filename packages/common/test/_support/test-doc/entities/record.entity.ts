import { ComplexField, ComplexType } from '@opra/common';

@ComplexType({
  abstract: true,
  description: 'Base Record schema'
})
export class Record {

  @ComplexField()
  id: number;

  @ComplexField()
  deleted?: boolean;

}
