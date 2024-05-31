import { DATATYPE_METADATA } from '../../constants.js';
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

const metadata = Reflect.getMetadata(DATATYPE_METADATA, ObjectType);
metadata.ctor = Object;
