import { isDate, isDateString } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A full datetime value',
  example: [
    '2021-04-18T22:30:15',
    '2021-04-18 22:30:15',
    '2021-04-18 22:30'
  ],
  decoder: isDate({precision: 'time'}),
  encoder: isDateString({precision: 'time', trim: 'time'})
})
export class DatetimeType {

}
