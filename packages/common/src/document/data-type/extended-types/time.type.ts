import { type Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

const TIME_PATTERN = /^([0-1][0-9]|2[0-4]):([0-5][0-9])(?::([0-5][0-9]))?$/;

@(SimpleType({
  description: 'Time string in 24h format',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
})
  .Example('18:23:00', 'Full time value')
  .Example('18:23:00', 'Time value without seconds'))
export class TimeType {
  constructor(attributes?: Partial<TimeType>) {
    if (attributes) Object.assign(this, attributes);
  }

  @SimpleType.Attribute({
    description: 'Minimum value',
  })
  minValue?: string;

  @SimpleType.Attribute({
    description: 'Maximum value',
  })
  maxValue?: string;

  protected [DECODER](properties: Partial<this>): Validator {
    const fn = vg.matches(TIME_PATTERN, {
      formatName: 'time',
      coerce: true,
    });
    const x: Validator[] = [];
    if (properties.minValue) x.push(vg.isGte(properties.minValue));
    if (properties.maxValue) x.push(vg.isLte(properties.maxValue));
    return x.length > 0 ? vg.pipe([fn, ...x], { returnIndex: 0 }) : fn;
  }

  protected [ENCODER](properties: Partial<this>): Validator {
    return this[DECODER](properties);
  }
}
