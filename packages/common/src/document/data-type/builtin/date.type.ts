import { isDate, isDateString } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Date only string, for example, 2021-04-18',
  decoder: isDate({
    format: ['YYYY-MM-DD', 'YYYY',
      'YYYY-MM-DDTHH:mm:ss',
      'YYYY-MM-DDTHH:mm',
      'YYYY-MM-DD HH:mm:ss',
      'YYYY-MM-DD HH:mm'
    ]
  }),
  encoder: isDateString({format: 'YYYY-MM-DD'})
})
export class DateType {
}
