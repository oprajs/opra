import { isDateString } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'An approximate date value',
  example: [
    '2021-04-18',
    '2021-04',
    '2021',
  ],
  decoder: isDateString({trim: 'date'}),
  encoder: isDateString({trim: 'date'})
})
export class ApproxDateType {
}
