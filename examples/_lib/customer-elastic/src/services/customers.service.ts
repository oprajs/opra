// import assert from 'node:assert';
// import { MongoCollectionService, MongoService } from '@opra/mongodb';
// import { Customer } from '../models/index.js';
//
// export class CustomersService extends MongoCollectionService<Customer> {
//   static idGen = 1000;
//
//   constructor(options?: MongoCollectionService.Options) {
//     super(Customer, {
//       collectionName: 'Customers',
//       interceptor: (callback: () => any, info: MongoService.CommandInfo) => {
//         if (info.crud === 'create') info.input!._id = ++CustomersService.idGen;
//         return callback();
//       },
//       ...options,
//     });
//     assert.ok(options?.db, 'You must provide "db" argument');
//   }
// }
