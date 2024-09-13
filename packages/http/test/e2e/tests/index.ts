import { OpraTestClient } from '@opra/testing';
import { collectionCreateTests } from './collection-create.test';
import { collectionDeleteTests } from './collection-delete.test';
import { collectionDeleteManyTests } from './collection-delete-many.test';
import { collectionFindManyTests } from './collection-find-many.test';
import { collectionGetTests } from './collection-get.test';
import { collectionUpdateTests } from './collection-update.test';
import { collectionUpdateManyTests } from './collection-update-many.test';
import { singletonCreateTests } from './singleton-create.test';
import { singletonDeleteTests } from './singleton-delete.test';
import { singletonGetTests } from './singleton-get.test';
import { singletonUpdateTests } from './singleton-update.test';

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
