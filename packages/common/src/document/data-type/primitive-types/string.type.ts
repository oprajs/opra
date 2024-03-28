import { isString, Validator, vg, Context } from 'valgen';
import { DATATYPE_METADATA, DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A sequence of characters'
})
export class StringType {

  constructor(attributes?: Partial<StringType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    const x: Validator[] = [isString];
    if (this.pattern) {
      const meta = Reflect.getMetadata(DATATYPE_METADATA, Object.getPrototypeOf(this).constructor);
      x.push(vg.isRegExp(this.pattern, {formatName: meta.name}));
    }
    if (this.minLength)
      x.push(vg.lengthMin(this.minLength))
    if (this.maxLength)
      x.push(vg.lengthMin(this.maxLength))
    return x.length > 1 ? vg.allOf(...x) : x[0];
  }

  [ENCODER](): Validator {
    return this[DECODER]();
  }

  @SimpleType.Attribute({
    description: 'Regex pattern to be used for validation'
  })
  pattern?: string | RegExp;

  @SimpleType.Attribute({
    description: 'Minimum number of characters'
  })
  minLength?: number;

  @SimpleType.Attribute({
    description: 'Minimum number of characters'
  })
  maxLength?: number;

}
