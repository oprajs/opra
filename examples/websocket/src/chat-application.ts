// import { ApiDocument } from '@opra/common';
// import { WsAdapter } from '@opra/ws';
// import http from 'http';
//
// export class ChatApplication {
//   declare adapter: WsAdapter;
//   declare document: ApiDocument;
//   declare server: http.Server;
//
//   static async create(options?: WsAdapter.Options): Promise<ChatApplication> {
//     // const app = new ChatApplication();
//     // app.document = await CustomerApiDocument.create(app.db);
//     // app.express = express();
//     // app.adapter = new ExpressAdapter(app.express, app.document, {
//     //   scope: 'api',
//     //   ...options,
//     // });
//     // return app;
//   }
//
//   protected constructor() {}
//
//   async close() {
//     await this.dbClient?.close();
//     await this.adapter?.close();
//   }
// }
