import { isDate, isDateString } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Timestamp, for example, 2021-04-18T09:12:53',
  decoder: isDate({
    format: ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD', 'YYYY']
  }),
  encoder: isDateString({format: 'YYYY-MM-DDTHH:mm:ss'})
})
export class TimestampType {

}
