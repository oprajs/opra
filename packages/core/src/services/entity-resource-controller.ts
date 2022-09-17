import { Maybe } from 'ts-gems';
import { EntityOutput } from '@sqb/connect';
import { ExecutionContext } from '../implementation/execution-context.js';

export interface IEntityService {
  processRequest(ctx: ExecutionContext): any;
}

export abstract class EntityResourceController<T> {

  async search(ctx: ExecutionContext): Promise<Maybe<EntityOutput<T>>[]> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async get(ctx: ExecutionContext): Promise<Maybe<EntityOutput<T>>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async count(ctx: ExecutionContext): Promise<Maybe<number>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async create(ctx: ExecutionContext): Promise<Maybe<EntityOutput<T>>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async update(ctx: ExecutionContext): Promise<Maybe<EntityOutput<T>>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async updateMany(ctx: ExecutionContext): Promise<Maybe<number>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async delete(ctx: ExecutionContext): Promise<Maybe<boolean | number>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async deleteMany(ctx: ExecutionContext): Promise<Maybe<number>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  abstract getService(ctx: ExecutionContext): IEntityService | Promise<IEntityService>;
}
