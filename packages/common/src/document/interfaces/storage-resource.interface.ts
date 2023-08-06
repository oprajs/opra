import { Readable } from 'stream';

export interface StorageResource {
  delete?(...args: any[]): Promise<number | undefined>;

  get?(...args: any[]): Promise<Buffer | Readable | undefined>;

  post?(...args: any[]): Promise<void>;
}
