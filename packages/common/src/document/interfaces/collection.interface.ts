import { PartialDTO } from '../../types.js';

export interface ICollection<T> {
  create?(...args: any[]): Promise<PartialDTO<T>>;

  delete?(...args: any[]): Promise<number> | undefined;

  deleteMany?(...args: any[]): Promise<number> | undefined;

  findMany?(...args: any[]): Promise<PartialDTO<T>[] | undefined>;

  get?(...args: any[]): Promise<PartialDTO<T> | undefined>;

  update?(...args: any[]): Promise<PartialDTO<T> | undefined>;

  updateMany?(...args: any[]): Promise<number> | undefined;
}
