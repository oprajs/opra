import { PartialOutput } from '../../types.js';

export interface ICollection<T> {
  create?(...args: any[]): Promise<PartialOutput<T>>;

  delete?(...args: any[]): Promise<number> | undefined;

  deleteMany?(...args: any[]): Promise<number> | undefined;

  findMany?(...args: any[]): Promise<PartialOutput<T>[] | undefined>;

  get?(...args: any[]): Promise<PartialOutput<T> | undefined>;

  update?(...args: any[]): Promise<PartialOutput<T> | undefined>;

  updateMany?(...args: any[]): Promise<number> | undefined;
}
