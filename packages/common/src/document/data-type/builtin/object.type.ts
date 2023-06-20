import { ComplexType } from '../complex-type.js';

@ComplexType({
  name: 'object',
  description: 'A non modelled object',
  additionalFields: true,
  ctor: Object
})
export class ObjectType {

}
