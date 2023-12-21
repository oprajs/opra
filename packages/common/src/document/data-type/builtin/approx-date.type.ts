import { vg } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'An approximate date value',
  example: [
    '2021-04-18',
    '2021-04',
    '2021',
  ],
  decoder: vg.isDateString({trim: 'date'}),
  encoder: vg.isDateString({trim: 'date'})
})
export class ApproxDateType {
}
