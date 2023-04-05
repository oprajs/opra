import { SimpleType } from '../simple-type.js';
import { TimestampType } from './timestamp.type.js';

@SimpleType({
  description: 'full-date notation as defined by RFC 3339, section 5.6, for example, 2021-04-18',
})
export class DateType extends TimestampType {
  format = 'YYYY-MM-DD';

}
