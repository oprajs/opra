import { isDate, isDateString } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A date without time',
  example: ['2021-04-18'],
  decoder: isDate({precision: 'date'}),
  encoder: isDateString({precision: 'date', trim: 'date'})
})
export class DateType {
}
