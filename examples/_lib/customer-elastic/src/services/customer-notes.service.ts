// import assert from 'node:assert';
// import { MongoCollectionService, MongoNestedService, MongoService } from '@opra/mongodb';
// import { Note } from '../models/index.js';
//
// export class CustomerNotesService extends MongoNestedService<Note> {
//   static idGen = 1000;
//
//   constructor(options?: MongoCollectionService.Options) {
//     super(Note, 'notes', {
//       collectionName: 'Customers',
//       interceptor: (callback: () => any, info: MongoService.CommandInfo) => {
//         if (info.crud === 'create') info.input!._id = ++CustomerNotesService.idGen;
//         return callback();
//       },
//       ...options,
//     });
//     assert.ok(options?.db, 'You must provide "db" argument');
//   }
// }
