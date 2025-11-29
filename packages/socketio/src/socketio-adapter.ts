import {
  ApiDocument,
  OpraException,
  OpraSchema,
  WSApi,
  WSController,
  WSOperation,
} from '@opra/common';
import { PlatformAdapter } from '@opra/core';
import type * as http from 'http';
import type * as http2 from 'http2';
import type * as https from 'https';
import * as socketio from 'socket.io';
import { SocketioContext } from './socketio-context.js';

// const noOp = () => undefined;
type TServerInstance =
  | http.Server
  | https.Server
  | http2.Http2SecureServer
  | http2.Http2Server;

/**
 *
 * @class SocketioAdapter
 */
export class SocketioAdapter extends PlatformAdapter<SocketioAdapter.Events> {
  static readonly PlatformName = 'socketio';
  protected _controllerInstances = new Map<WSController, any>();
  protected _eventsRegByName = new Map<string, MessageHandlerReg>();
  protected _eventsRegByPattern: MessageHandlerReg[] = [];
  protected _scope?: string;
  readonly transform: OpraSchema.Transport = 'ws';
  readonly platform = SocketioAdapter.PlatformName;
  readonly interceptors: (
    | SocketioAdapter.InterceptorFunction
    | SocketioAdapter.IWSInterceptor
  )[];
  readonly server: socketio.Server;

  /**
   *
   * @constructor
   */
  constructor(document: ApiDocument, options?: SocketioAdapter.Options);
  constructor(document: ApiDocument, options?: SocketioAdapter.Options) {
    super(options);
    this._document = document;
    if (!(this.document.api instanceof WSApi)) {
      throw new TypeError(`The document doesn't expose a WS Api`);
    }
    this.interceptors = [...(options?.interceptors || [])];
    this._scope = options?.scope;
    this.server = new socketio.Server();
    this.server.on('error', error => {
      this.emit('error', error, undefined, this);
    });
    this.server.on('connection', (socket: socketio.Socket) => {
      this._initSocket(socket);
      this.emit('connection', socket, this);
    });
    for (const contDef of this.api.controllers.values()) {
      for (const oprDef of contDef.operations.values()) {
        const fn: Function = contDef.instance[oprDef.name];
        if (typeof fn !== 'function') continue;
        const reg: MessageHandlerReg = {
          event: oprDef.event,
          contDef,
          oprDef,
          handler: fn,
          decoders: [],
        };
        if (typeof reg.event === 'string')
          this._eventsRegByName.set(reg.event, reg);
        else this._eventsRegByPattern.push(reg);
        /** Generate decoders */
        if (oprDef.arguments?.length) {
          for (const dt of oprDef.arguments) {
            reg.decoders.push(
              dt.generateCodec('decode', {
                scope: this.scope,
                ignoreReadonlyFields: true,
              }),
            );
          }
        }
        /** Generate response encoder */
        if (oprDef.response) {
          reg.encoder = oprDef.response.generateCodec('encode', {
            scope: this.scope,
            ignoreWriteonlyFields: true,
          });
        }
      }
    }
  }

  get api(): WSApi {
    return this.document.wsApi;
  }

  get scope(): string | undefined {
    return this._scope;
  }

  close(): Promise<void> {
    return this.server.close();
  }

  /**
   * Attaches socket.io to a server or port.
   *
   * @param srv - server or port
   * @param opts - options passed to engine.io
   * @return self
   */
  listen(
    srv: TServerInstance | number,
    opts?: Partial<socketio.ServerOptions>,
  ): this {
    if (this.server.httpServer?.listening)
      throw new Error('Server is already listening');
    if (opts?.path) this.server.path(opts?.path);
    this.server.listen(srv, opts);
    return this;
  }

  protected _initSocket(socket: socketio.Socket) {
    socket.on('close', () => {
      this.emit('close', socket, this);
    });
    socket.on('error', error => {
      this.emit('error', error, socket, this);
    });
    socket.onAny((event, ...args: any[]) => {
      const callback = args.length > 0 ? args[args.length - 1] : null;
      const reg =
        this._eventsRegByName.get(event) ||
        this._eventsRegByPattern.find(r => (r.event as RegExp).test(event));
      if (!reg) {
        if (callback) callback(new Error(`Unknown event "${event}"`));
        return;
      }
      const parameters = callback ? args.slice(0, -1) : args;
      Promise.resolve().then(async () => {
        const ctx = new SocketioContext({
          __adapter: this,
          __contDef: reg.contDef,
          __oprDef: reg.oprDef,
          __controller: reg.contDef.instance,
          __handler: reg.handler,
          event,
          parameters,
        });
        try {
          let x = await reg.handler.apply(reg.contDef.instance, [
            ctx,
            ...parameters,
          ]);
          if (reg.encoder) x = reg.encoder(x);
          if (x != null && typeof x !== 'string') x = JSON.stringify(x);
          callback(x);
        } catch (err: any) {
          const error = new OpraException(err);
          callback(error);
        }
      });
    });
  }

  getControllerInstance<T>(controllerPath: string): T | undefined {
    const controller = this.api.findController(controllerPath);
    return controller && this._controllerInstances.get(controller);
  }
}

/**
 * @namespace SocketioAdapter
 */
export namespace SocketioAdapter {
  export type NextCallback = () => Promise<any>;

  export interface Options extends PlatformAdapter.Options {
    interceptors?: (InterceptorFunction | IWSInterceptor)[];
    scope?: string;
  }

  /**
   * @type InterceptorFunction
   */
  export type InterceptorFunction = IWSInterceptor['intercept'];

  /**
   * @interface IWSInterceptor
   */
  export type IWSInterceptor = {
    intercept(context: SocketioContext, next: NextCallback): Promise<any>;
  };

  export interface Events {
    error: [
      error: Error,
      socket: socketio.Socket | undefined,
      _this: SocketioAdapter,
    ];
    connection: [socket: socketio.Socket, _this: SocketioAdapter];
    close: [socket: socketio.Socket, _this: SocketioAdapter];
    execute: [context: SocketioContext];
  }
}

/**
 * @interface
 */
interface MessageHandlerReg {
  event: string | RegExp;
  handler: Function;
  contDef: WSController;
  oprDef: WSOperation;
  decoders: ((data: any) => any)[];
  encoder?: (data: any) => any;
}
