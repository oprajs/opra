import { Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'DateTime string value',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
})
  .Example('2021-04-18T22:30:15+01:00', 'Full date-time value with timezone')
  .Example('2021-04-18T22:30:15', 'Full date-time value without timezone')
  .Example('2021-04-18 22:30', 'Date-time value')
  .Example('2021-04-18', 'Date value')
  .Example('2021-04', 'Date value without day')
  .Example('2021', 'Year only value')
export class DateTimeStringType {
  constructor(attributes?: Partial<DateTimeStringType>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](properties: Partial<this>): Validator {
    const fn = vg.isDateString({ coerce: true });
    const x: Validator[] = [];
    if (properties.minValue) x.push(vg.isGte(properties.minValue));
    if (properties.maxValue) x.push(vg.isLte(properties.maxValue));
    return x.length > 0 ? vg.pipe([fn, ...x]) : fn;
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
