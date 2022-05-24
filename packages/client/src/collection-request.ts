import {Request} from './request';

export class CollectionRequest extends Request {
  protected _limit?: number;
  protected _skip?: number;

  constructor(readonly collection: string) {
    super();
  }

  limit(v: number): this {
    this._limit = v;
    return this;
  }

  skip(v: number): this {
    this._skip = v;
    return this;
  }

}
