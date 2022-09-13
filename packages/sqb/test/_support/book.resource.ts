import { ApiEntityResource } from '@opra/core';
import { Book } from './book.entity.js';

@ApiEntityResource(Book, {
  description: 'Book resource'
})
export class BooksResource {

}
