import * as _ from 'underscore';
import {RequestNode} from '../../../../src/index.js';

export class DataService {
  constructor(public data: any[],
              public keyProperty: string,
              public elementNames: string[],) {
  }

  async findAll(req: RequestNode): Promise<any> {
    return this.data
      .map(x => this._pickElements(req, x))
      .slice(req.skip || 0, (req.skip || 0) + (req.limit || 10));
  }

  async get(req: RequestNode): Promise<any> {
    return this.data
      .filter(x => x[this.keyProperty] === req.resourceKey)
      .map(x => this._pickElements(req, x))[0];
  }

  protected _pickElements(req: RequestNode, data: any): any {
    const elements = this.elementNames.filter(el =>
      ((!req.elements || req.elements.includes(el)) ||
        (req.include && req.include.includes(el))) &&
      (!req.exclude || !req.exclude.includes(el))
    );
    return _.pick(data, elements);
  }


}
