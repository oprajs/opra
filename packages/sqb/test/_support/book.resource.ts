import { EntityResource, ExecutionContext, ReadOperation, SearchOperation } from '@opra/core';
import { Book } from './book.entity.js';

@EntityResource(Book, {
  primaryKey: 'id',
  description: 'Book resource',
})
export class BooksResource {

  @ReadOperation()
  read(ctx: ExecutionContext) {
    //
  }

  @SearchOperation()
  search(ctx: ExecutionContext) {
    //
  }
}
