// import { OpraSchema, WSController, WSOperation } from '@opra/common';
// import { ExecutionContext } from '@opra/core';
// import type { AsyncEventEmitter } from 'node-events-async';
// import type { WsAdapter } from './ws-adapter.js';
//
// /**
//  * Provides the context for handling messages.
//  * It extends the ExecutionContext and implements the AsyncEventEmitter.
//  */
// export class WsContext extends ExecutionContext implements AsyncEventEmitter {
//   readonly protocol: OpraSchema.Transport;
//   readonly platform: string;
//   readonly adapter: WsAdapter;
//   readonly controller?: WSController;
//   readonly controllerInstance?: any;
//   readonly operation?: WSOperation;
//   readonly operationHandler?: Function;
//   readonly content: any;
//
//   /**
//    * Constructor
//    * @param init the context options
//    */
//   constructor(init: WsContext.Initiator) {
//     super({
//       ...init,
//       document: init.adapter.document,
//       documentNode: init.controller?.node,
//       protocol: 'ws',
//     });
//     this.adapter = init.adapter;
//     this.platform = init.adapter.platform;
//     this.protocol = 'ws';
//     if (init.controller) this.controller = init.controller;
//     if (init.controllerInstance)
//       this.controllerInstance = init.controllerInstance;
//     if (init.operation) this.operation = init.operation;
//     if (init.operationHandler) this.operationHandler = init.operationHandler;
//     this.content = init.content;
//   }
// }
//
// export namespace WsContext {
//   export interface Initiator
//     extends Omit<
//       ExecutionContext.Initiator,
//       'document' | 'protocol' | 'documentNode'
//     > {
//     adapter: WsAdapter;
//     controller?: WSController;
//     controllerInstance?: any;
//     operation?: WSOperation;
//     operationHandler?: Function;
//     content: any;
//   }
// }
