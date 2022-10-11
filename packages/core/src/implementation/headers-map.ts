import { ResponsiveMap } from '@opra/schema';
import { HttpHeaders } from '../enums/index.js';

export class HeadersMap extends ResponsiveMap<string, string> {
  constructor(data?: any) {
    super(data, Array.from(Object.values(HttpHeaders)));
  }

  toObject(): Record<string, string> {
    return Array.from(this.keys()).sort()
        .reduce((a, k) => {
          a[k] = this.get(k);
          return a;
        }, {});
  }
}
