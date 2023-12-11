import { PartialDTO } from '../../types.js';

export interface ISingleton<T> {
  create?(...args: any[]): Promise<PartialDTO<T>>;

  delete?(...args: any[]): Promise<number> | undefined;

  get?(...args: any[]): Promise<PartialDTO<T> | undefined>;

  update?(...args: any[]): Promise<PartialDTO<T> | undefined>;
}
