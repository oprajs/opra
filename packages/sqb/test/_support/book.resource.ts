import { OprEntityResource } from '@opra/schema';
import { Book } from './book.entity.js';

@OprEntityResource(Book, {
  description: 'Book resource',
  keyFields: 'id'
})
export class BooksResource {

}
