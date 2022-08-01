import _ from 'lodash';
import { OpraQueryNode } from '@opra/common/src';

export class DataService {
  constructor(public data: any[],
              public keyProperty: string,
              public elementNames: string[],) {
  }

  findAll(req: OpraQueryNode): any[] {
    const skip = req.skip || 0;
    const limit = skip + (req.limit || 10);
    return this.data
        .slice(skip, limit)
        .map(x => this._pickElements(req, x));
  }

  get(req: OpraQueryNode): any {
    const keyValue = typeof req.keyValue === 'number'
        ? req.keyValue
        : (typeof req.keyValue === 'string'
                ? parseInt(req.keyValue, 10) : undefined
        );
    return this.data
        .filter(x => x[this.keyProperty] === keyValue)
        .map(x => this._pickElements(req, x))[0];
  }

  protected _pickElements(req: any, data: any): any {
    const elements = this.elementNames.filter(el =>
        ((!req.elements || req.elements.includes(el)) ||
            (req.include && req.include.includes(el))) &&
        (!req.exclude || !req.exclude.includes(el))
    );
    return _.pick(data, elements);
  }


}
