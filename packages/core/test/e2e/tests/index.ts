import { OpraTestClient } from '@opra/testing';
import { collectionCreateTests } from './collection-create.test.js';
import { collectionDeleteManyTests } from './collection-delete-many.test.js';
import { collectionDeleteTests } from './collection-delete-one.test.js';
import { collectionSearchTests } from './collection-find-many.test.js';
import { collectionGetTests } from './collection-find-one.test.js';
import { collectionUpdateManyTests } from './collection-update-many.test.js';
import { collectionUpdateTests } from './collection-update-one.test.js';
import { singletonCreateTests } from './singleton-create.test.js';
import { singletonDeleteTests } from './singleton-delete.test.js';
import { singletonGetTests } from './singleton-get.test.js';
import { singletonUpdateTests } from './singleton-update.test.js';

export function collectionTests(args: { client: OpraTestClient }) {
  collectionCreateTests(args);
  collectionGetTests(args);
  collectionSearchTests(args);
  collectionUpdateTests(args);
  collectionUpdateManyTests(args);
  collectionDeleteTests(args);
  collectionDeleteManyTests(args);
}

export function singletonTests(args: { client: OpraTestClient }) {
  singletonCreateTests(args);
  singletonGetTests(args);
  singletonUpdateTests(args);
  singletonDeleteTests(args);
}
