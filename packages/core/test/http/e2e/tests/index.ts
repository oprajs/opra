import { OpraTestClient } from '@opra/testing';
import { entityCreateTests } from './entity-create.test.js';
import { entityGetTests } from './entity-get.test.js';

export function entityTests(args: { client: OpraTestClient }) {
  // entityCreateTests(args);
  entityGetTests(args);
  // collectionFindManyTests(args);
  // collectionUpdateTests(args);
  // collectionUpdateManyTests(args);
  // collectionDeleteTests(args);
  // collectionDeleteManyTests(args);
}
