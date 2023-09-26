import { cloneObject, omitUndefined } from '../helpers/index.js';
import { OpraSchema } from '../schema/index.js';

export class DocumentBase {
  url?: string;
  info: OpraSchema.DocumentInfo;

  constructor() {
    this.info = {
      version: '',
      title: ''
    }
  }

  /**
   * Export as OPRA schema definition object
   */
  exportSchema(): OpraSchema.DocumentBase {
    return omitUndefined<OpraSchema.DocumentBase>({
      version: OpraSchema.SpecVersion,
      url: this.url,
      info: cloneObject(this.info, true)
    });
  }

}
