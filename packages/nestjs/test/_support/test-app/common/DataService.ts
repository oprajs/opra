import { OpraQueryNode } from '@opra/common/src';

export class DataService {
  constructor(public data: any[],
              public keyProperty: string) {
  }

  findAll(req: OpraQueryNode): any[] {
    const keyValue = typeof req.resourceKey === 'number'
        ? req.resourceKey
        : (typeof req.resourceKey === 'string'
                ? parseInt(req.resourceKey, 10) : undefined
        );
    return this.data
        .filter(x => x[this.keyProperty] === keyValue)
        .slice(req.skip || 0, (req.skip || 0) + (req.limit || 10));
  }

  get(req: OpraQueryNode): any {
    return this.findAll(req)[0];
  }

}
