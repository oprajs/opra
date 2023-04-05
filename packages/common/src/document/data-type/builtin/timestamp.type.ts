import dayjs from 'dayjs';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'date-time notation as defined by RFC 3339, section 5.6, for example, 2021-04-18T09:12:53',
  ctor: Date
})
export class TimestampType {
  format = 'YYYY-MM-DDTHH:mm:ss';

  decode(v: any): Date | undefined {
    return dayjs(v).toDate();
  }

  encode(v: any): string | undefined {
    if (!v)
      return undefined;
    const d = dayjs(v);
    if (!d.isValid())
      throw new TypeError(`Invalid date value ${v}`)
    return dayjs(v).format(this.format);
  }

}
