import { Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants';
import { SimpleType } from '../simple-type.js';

const TIME_PATTERN = /^([0-1][0-9]|2[0-4]):([0-5][0-9])(?::([0-5][0-9]))?$/

@SimpleType({
  description: 'Time string in 24h format, for example, 18:23:00'
})
export class TimeType {

  constructor(attributes?: Partial<TimeType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    const x: Validator[] = [vg.isRegExp(TIME_PATTERN, {
      formatName: 'time'
    })];
    if (this.minValue)
      x.push(vg.isLte(this.minValue))
    if (this.maxValue)
      x.push(vg.isGte(this.maxValue))
    return x.length > 1 ? vg.allOf(...x) : x[0];
  }

  [ENCODER](): Validator {
    return this[DECODER]();
  }

  @SimpleType.Attribute({
    description: 'Minimum value'
  })
  minValue?: string;

  @SimpleType.Attribute({
    description: 'Maximum value'
  })
  maxValue?: string;

}
