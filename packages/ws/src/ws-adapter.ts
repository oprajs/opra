// import { ApiDocument, OpraSchema, WSApi, WSController } from '@opra/common';
// import { PlatformAdapter } from '@opra/core';
// import type * as http from 'http';
// import type { Http2SecureServer, Http2Server } from 'http2';
// import type { Server as HTTPSServer } from 'https';
// import * as sio from 'socket.io';
// import { WsContext } from './ws-context.js';
//
// const noOp = () => undefined;
// type TServerInstance =
//   | http.Server
//   | HTTPSServer
//   | Http2SecureServer
//   | Http2Server;
//
// /**
//  *
//  * @class WsAdapter
//  */
// export class WsAdapter extends PlatformAdapter<WsAdapter.Events> {
//   static readonly PlatformName = 'ws';
//   protected _controllerInstances = new Map<WSController, any>();
//   readonly protocol: OpraSchema.Transport = 'ws';
//   readonly platform = WsAdapter.PlatformName;
//   readonly interceptors: (
//     | WsAdapter.InterceptorFunction
//     | WsAdapter.IWSInterceptor
//   )[];
//   readonly wss: sio.Server;
//
//   /**
//    *
//    * @constructor
//    */
//   constructor(document: ApiDocument, options?: WsAdapter.Options) {
//     super(options);
//     this._document = document;
//     if (
//       !(
//         this.document.api instanceof WSApi &&
//         this.document.api.platform === WsAdapter.PlatformName
//       )
//     ) {
//       throw new TypeError(`The document doesn't expose a WS Api`);
//     }
//     this.interceptors = [...(options?.interceptors || [])];
//     if (options?.server) {
//       this.wss = new sio.Server(options.server, options);
//     } else if (options?.port) {
//       this.wss = new sio.Server(options.port, options);
//     } else this.wss = new sio.Server(options);
//     this.wss.on('connection', (socket: sio.Socket) => {
//       this.emit('connection', socket, this);
//       socket.on('message', message => {
//         // console.log('Received:', message.toString());
//         // socket.send(`You said: ${message}`);
//       });
//       socket.on('close', () => {
//         this.emit('close', socket, this);
//       });
//       socket.on('error', () => {
//         this.emit('error', socket, this);
//       });
//     });
//   }
//
//   get api(): WSApi {
//     return this.document.wsApi;
//   }
//
//   getControllerInstance<T>(controllerPath: string): T | undefined {
//     const controller = this.api.findController(controllerPath);
//     return controller && this._controllerInstances.get(controller);
//   }
// }
//
// /**
//  * @namespace WsAdapter
//  */
// export namespace WsAdapter {
//   export type NextCallback = () => Promise<any>;
//
//   export interface Options
//     extends PlatformAdapter.Options,
//       Partial<sio.ServerOptions> {
//     server?: TServerInstance;
//     port?: number;
//     interceptors?: (InterceptorFunction | IWSInterceptor)[];
//   }
//
//   /**
//    * @type InterceptorFunction
//    */
//   export type InterceptorFunction = IWSInterceptor['intercept'];
//
//   /**
//    * @interface IWSInterceptor
//    */
//   export type IWSInterceptor = {
//     intercept(context: WsContext, next: NextCallback): Promise<any>;
//   };
//
//   export interface Events {
//     error: [error: Error, context: WsContext | undefined];
//     connection: [socket: ws.WebSocket, _this: WsAdapter];
//     close: [socket: ws.WebSocket, _this: WsAdapter];
//     execute: [context: WsContext];
//   }
// }
