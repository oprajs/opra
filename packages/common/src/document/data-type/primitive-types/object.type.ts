import { ComplexType } from '../complex-type.js';

@ComplexType({
  name: 'object',
  description: 'A non modelled object',
  additionalFields: true,
})
export class ObjectType {
  constructor(properties?: Partial<ObjectType>) {
    if (properties) Object.assign(this, properties);
  }
}
