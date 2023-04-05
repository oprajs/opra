import { Resource } from '@opra/common';
import { QueryRequestContext } from '../request-context/query-request-context.js';

export abstract class QueryBase {
  readonly kind: string;
  abstract subject: string;
  abstract method: string;
  abstract operation: string;

  protected constructor(public resource: Resource) {
    this.kind = Object.getPrototypeOf(this).constructor.name;
  }

  protected abstract _execute(context: QueryRequestContext): Promise<any>;

}
