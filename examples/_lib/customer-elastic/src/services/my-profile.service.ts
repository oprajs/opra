// import assert from 'node:assert';
// import { MongoSingletonService } from '@opra/mongodb';
// import { Profile } from '../models/index.js';
//
// export class MyProfileService extends MongoSingletonService<Profile> {
//   constructor(options?: MongoSingletonService.Options) {
//     super(Profile, {
//       _id: 1,
//       collectionName: 'MyProfile',
//       ...options,
//     });
//     assert.ok(options?.db, 'You must provide "db" argument');
//   }
// }
