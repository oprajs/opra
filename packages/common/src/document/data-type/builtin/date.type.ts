import { vg } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A date without time',
  example: ['2021-04-18'],
  decoder: vg.isDate({precision: 'date'}),
  encoder: vg.isDateString({precision: 'date', trim: 'date'})
})
export class DateType {
}
