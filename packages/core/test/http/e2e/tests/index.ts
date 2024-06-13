import { OpraTestClient } from '@opra/testing';
import { collectionCreateTests } from './collection-create.test.js';
import { collectionDeleteTests } from './collection-delete.test.js';
import { collectionDeleteManyTests } from './collection-delete-many.test.js';
import { collectionFindManyTests } from './collection-find-many.test.js';
import { collectionGetTests } from './collection-get.test.js';
import { collectionUpdateTests } from './collection-update.test.js';
import { collectionUpdateManyTests } from './collection-update-many.test.js';
import { singletonCreateTests } from './singleton-create.test.js';
import { singletonDeleteTests } from './singleton-delete.test.js';
import { singletonGetTests } from './singleton-get.test.js';
import { singletonUpdateTests } from './singleton-update.test.js';

export function entityTests(args: { client: OpraTestClient }) {
  collectionCreateTests(args);
  collectionGetTests(args);
  collectionFindManyTests(args);
  collectionUpdateTests(args);
  collectionUpdateManyTests(args);
  collectionDeleteTests(args);
  collectionDeleteManyTests(args);

  singletonCreateTests(args);
  singletonGetTests(args);
  singletonUpdateTests(args);
  singletonDeleteTests(args);
}
