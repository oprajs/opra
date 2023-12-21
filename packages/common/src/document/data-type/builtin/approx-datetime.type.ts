import { isDateString } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'An approximate datetime value.',
  example: [
    '2021-04-18T22:30:15+01:00',
    '2021-04-18T22:30:15',
    '2021-04-18 22:30',
    '2021-04-18',
    '2021-04',
    '2021',
  ],
  decoder: isDateString,
  encoder: isDateString
})
export class ApproxDatetimeType {
}
