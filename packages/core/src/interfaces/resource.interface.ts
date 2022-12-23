import { Maybe } from 'ts-gems';
import { ResourceInfo } from '@opra/common';
import { PartialOutput } from '../types.js';

export interface IResource {
  init?(resource: ResourceInfo): void | Promise<void>;
}

export interface ICollectionResource<T, TOutput = PartialOutput<T>> extends IResource {

  create?(...args: any[]): TOutput | Promise<TOutput>;

  count?(...args: any[]): number | Promise<number>;

  delete?(...args: any[]): boolean | Promise<boolean>;

  deleteMany?(...args: any[]): number | Promise<number>;

  get?(...args: any[]): Maybe<TOutput> | Promise<Maybe<TOutput>>;

  search?(...args: any[]): TOutput[] | Promise<TOutput[]>;

  update?(...args: any[]): Maybe<TOutput> | Promise<Maybe<TOutput>>;

  updateMany?(...args: any[]): number | Promise<number>;

}

export interface ISingletonResource<T, TOutput = PartialOutput<T>> extends IResource {

  create?(...args: any[]): TOutput | Promise<TOutput>;

  delete?(...args: any[]): boolean | Promise<boolean>;

  get?(...args: any[]): Maybe<TOutput> | Promise<Maybe<TOutput>>;

  update?(...args: any[]): Maybe<TOutput> | Promise<Maybe<TOutput>>;

}
