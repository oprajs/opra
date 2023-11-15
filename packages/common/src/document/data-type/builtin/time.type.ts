import { isMatches } from 'valgen';
import { SimpleType } from '../simple-type.js';

const TIME_PATTERN = /^([0-1][0-9]|2[0-4]):([0-5][0-9])(?::([0-5][0-9]))?$/

@SimpleType({
  description: 'Time string in 24h format, for example, 18:23:00',
  decoder: isMatches(TIME_PATTERN, {
    formatName: 'time',
    onFail: () => '{{label}} is not a valid time'
  }),
  encoder: isMatches(TIME_PATTERN, {
    formatName: 'time',
    onFail: () => '{{label}} is not a valid time'
  })
})
export class TimeType {

}
