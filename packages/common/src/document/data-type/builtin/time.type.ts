import { isDateString } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Time string in 24h format, for example, 18:23:00',
  decoder: isDateString({
    format: ['HH:mm:ss', 'HH:mm'],
    onFail: () => '{{label}} is not a valid time'
  }),
  encoder: isDateString({format: ['HH:mm:ss', 'HH:mm'],
    onFail: () => '{{label}} is not a valid time'
  })
})
export class TimeType {

}
