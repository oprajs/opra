import { isPlainObject } from '@jsopen/objects';
import { ApiDocument, OpraSchema, WSApi, WSController } from '@opra/common';
import { PlatformAdapter } from '@opra/core';
import type * as http from 'http';
import type * as http2 from 'http2';
import type * as https from 'https';
import * as socketio from 'socket.io';
import { WsContext } from './ws-context.js';

// const noOp = () => undefined;
type TServerInstance =
  | http.Server
  | https.Server
  | http2.Http2SecureServer
  | http2.Http2Server;

/**
 *
 * @class WsAdapter
 */
export class WsAdapter extends PlatformAdapter<WsAdapter.Events> {
  static readonly PlatformName = 'socketio';
  protected _controllerInstances = new Map<WSController, any>();
  readonly protocol: OpraSchema.Transport = 'ws';
  readonly platform = WsAdapter.PlatformName;
  readonly interceptors: (
    | WsAdapter.InterceptorFunction
    | WsAdapter.IWSInterceptor
  )[];
  readonly server: socketio.Server;

  /**
   *
   * @constructor
   */
  constructor(document: ApiDocument, options?: WsAdapter.Options);
  constructor(document: ApiDocument, port: number, options?: WsAdapter.Options);
  constructor(
    document: ApiDocument,
    server: TServerInstance,
    options?: WsAdapter.Options,
  );
  constructor(
    document: ApiDocument,
    serverOrPort?: TServerInstance | number | WsAdapter.Options,
    options?: WsAdapter.Options,
  ) {
    const opts: WsAdapter.Options | undefined =
      arguments.length >= 3
        ? options
        : isPlainObject(serverOrPort)
          ? (serverOrPort as WsAdapter.Options)
          : {};
    super(options);
    this._document = document;
    if (!(this.document.api instanceof WSApi)) {
      throw new TypeError(`The document doesn't expose a WS Api`);
    }
    this.interceptors = [...(opts?.interceptors || [])];
    if (serverOrPort && !isPlainObject(serverOrPort)) {
      this.server = new socketio.Server(serverOrPort, opts);
    } else if (typeof serverOrPort === 'number') {
      this.server = new socketio.Server(serverOrPort, opts);
    } else this.server = new socketio.Server(options);
    this.server.on('error', error => {
      this.emit('error', error, undefined, this);
    });
    this.server.on('connection', (socket: socketio.Socket) => {
      this._initSocket(socket);
      this.emit('connection', socket, this);
    });
  }

  get api(): WSApi {
    return this.document.wsApi;
  }

  close(): Promise<void> {
    return this.server.close();
  }

  protected _initSocket(socket: socketio.Socket) {
    socket.on('close', () => {
      this.emit('close', socket, this);
    });
    socket.on('error', error => {
      this.emit('error', error, socket, this);
    });
    for (const controller of this.api.controllers.values()) {
      for (const operation of controller.operations.values()) {
        //
      }
    }
  }

  getControllerInstance<T>(controllerPath: string): T | undefined {
    const controller = this.api.findController(controllerPath);
    return controller && this._controllerInstances.get(controller);
  }
}

/**
 * @namespace WsAdapter
 */
export namespace WsAdapter {
  export type NextCallback = () => Promise<any>;

  export interface Options
    extends PlatformAdapter.Options,
      Partial<socketio.ServerOptions> {
    interceptors?: (InterceptorFunction | IWSInterceptor)[];
  }

  /**
   * @type InterceptorFunction
   */
  export type InterceptorFunction = IWSInterceptor['intercept'];

  /**
   * @interface IWSInterceptor
   */
  export type IWSInterceptor = {
    intercept(context: WsContext, next: NextCallback): Promise<any>;
  };

  export interface Events {
    error: [
      error: Error,
      socket: socketio.Socket | undefined,
      _this: WsAdapter,
    ];
    connection: [socket: socketio.Socket, _this: WsAdapter];
    close: [socket: socketio.Socket, _this: WsAdapter];
    execute: [context: WsContext];
  }
}
