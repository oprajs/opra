import { ComplexType } from '../complex-type.js';

@ComplexType({
  name: 'object',
  description: 'A non modelled object',
  additionalFields: true
})
export class ObjectType {

  coerce(v: any): {} | undefined {
    if (v == null) return v;
    return typeof v === 'object' ? v : {};
  }

}
