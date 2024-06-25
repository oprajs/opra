import { Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Date string value',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
})
  .Example('2021-04-18', 'Full date value')
  .Example('2021-04', 'Date value without day')
  .Example('2021', 'Year only value')
export class DateStringType {
  constructor(attributes?: Partial<DateStringType>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](properties: Partial<this>): Validator {
    const fn = vg.isDateString({ trim: 'date', coerce: true });
    const x: Validator[] = [];
    if (properties.minValue) x.push(vg.isGte(properties.minValue));
    if (properties.maxValue) x.push(vg.isLte(properties.maxValue));
    return x.length > 0 ? vg.pipe([fn, ...x], { returnIndex: 0 }) : fn;
  }

  protected [ENCODER](properties: Partial<this>): Validator {
    return this[DECODER](properties);
  }

  @SimpleType.Attribute({
    description: 'Minimum value',
  })
  minValue?: string;

  @SimpleType.Attribute({
    description: 'Maximum value',
  })
  maxValue?: string;
}
