import { cloneObject } from '../helpers/index.js';
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
    return {
      version: OpraSchema.SpecVersion,
      url: this.url,
      info: cloneObject(this.info, true)
    } as OpraSchema.DocumentBase;
  }

}
