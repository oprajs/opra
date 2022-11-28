import { HttpHeaders } from '../enums/http-headers.enum.js';
import { ResponsiveMap } from './responsive-map.js';

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
