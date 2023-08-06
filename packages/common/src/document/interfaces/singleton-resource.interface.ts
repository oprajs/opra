import { PartialOutput } from '../../types.js';

export interface SingletonResource<T> {
  create?(...args: any[]): Promise<PartialOutput<T>>;

  delete?(...args: any[]): Promise<number> | undefined;

  get?(...args: any[]): Promise<PartialOutput<T> | undefined>;

  update?(...args: any[]): Promise<PartialOutput<T> | undefined>;
}
