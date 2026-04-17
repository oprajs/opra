import { updateErrorMessage } from '@jsopen/objects';
import {
  ApiDocument,
  OperationResult,
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
import { type Validator, vg } from 'valgen';
import { SocketioContext } from './socketio-context.js';

// const noOp = () => undefined;
type TServerInstance =
  | http.Server
  | https.Server
  | http2.Http2SecureServer
  | http2.Http2Server;

/**
 * SocketioAdapter is a platform adapter for Socket.io.
 * It integrates Socket.io with the Opra framework to handle WebSocket operations.
 *
 * @extends PlatformAdapter
 */
export class SocketioAdapter extends PlatformAdapter<SocketioAdapter.Events> {
  static readonly PlatformName = 'socketio';
  protected _operationResultEncoder: Validator;
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
   * Initializes a new instance of the SocketioAdapter.
   *
   * @param document - The API document that defines the services and operations.
   * @param options - Optional configuration settings for the adapter.
   * @throws {@link TypeError} Throws if the document doesn't expose a Web Socket API.
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
    const operationResultType = document.node.getDataType(OperationResult);
    this._operationResultEncoder = operationResultType.generateCodec('encode', {
      scope: this.scope,
      ignoreWriteonlyFields: true,
    });
  }

  /**
   * Returns the Web Socket API exposed by the document.
   */
  get api(): WSApi {
    return this.document.getWsApi();
  }

  /**
   * Gets the scope of the adapter.
   */
  get scope(): string | undefined {
    return this._scope;
  }

  /**
   * Closes the Socket.io server and clears all internal states.
   *
   * @returns A promise that resolves when the server is closed.
   */
  async close(): Promise<void> {
    if (!this.server.engine) return;
    return this.server.close().finally(() => {
      this._controllerInstances.clear();
      this._eventsRegByName.clear();
      this._eventsRegByPattern = [];
    });
  }

  /**
   * Attaches Socket.io to a server or port and initializes message handlers.
   *
   * @param srv - The HTTP server instance or a port number to listen on.
   * @param opts - Options passed to the underlying Socket.io server.
   * @returns The current instance of SocketioAdapter.
   * @throws {@link Error} Throws if the server is already listening.
   */
  listen(
    srv: TServerInstance | number,
    opts?: Partial<socketio.ServerOptions>,
  ): this {
    if (this.server.httpServer?.listening)
      throw new Error('Server is already listening');
    if (opts?.path) this.server.path(opts?.path);

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
        /* Generate decoders */
        if (oprDef.arguments?.length) {
          for (const arg of oprDef.arguments) {
            let fn2 = arg.type.generateCodec('decode', {
              scope: this.scope,
              ignoreReadonlyFields: true,
            });
            if (arg.required) fn2 = vg.required(fn2);
            else fn2 = vg.optional(fn2);
            reg.decoders.push(fn2);
          }
        }
        /* Generate response encoder */
        if (oprDef.response) {
          reg.encoder = oprDef.response.generateCodec('encode', {
            scope: this.scope,
            ignoreWriteonlyFields: true,
          });
        }
      }
    }

    this.server.listen(srv, opts);
    return this;
  }

  /**
   * Initializes a socket connection, setting up event listeners.
   *
   * @param socket - The Socket.io socket instance.
   * @protected
   */
  protected _initSocket(socket: socketio.Socket) {
    socket.on('close', () => {
      this.emit('close', socket, this);
    });
    socket.on('error', error => {
      this.emit('error', error, socket, this);
    });
    socket.onAny((event, ...args: any[]) => {
      const callback =
        args.length > 0 && typeof args[args.length - 1] === 'function'
          ? args[args.length - 1]
          : null;
      Promise.resolve().then(async () => {
        try {
          const reg =
            this._eventsRegByName.get(event) ||
            this._eventsRegByPattern.find(r => (r.event as RegExp).test(event));
          if (!reg) {
            throw new OpraException(`Unknown event "${event}"`);
          }
          const inputParameters = callback ? args.slice(0, -1) : args;
          const ctx = new SocketioContext({
            __adapter: this,
            __contDef: reg.contDef,
            __oprDef: reg.oprDef,
            __controller: reg.contDef.instance,
            __handler: reg.handler,
            socket,
            event,
          });
          const callArgs: any[] = [ctx];
          let i = 0;
          for (const prm of inputParameters) {
            try {
              const v = reg.decoders[i](prm);
              const arg = reg.oprDef.arguments[i];
              ctx.parameters.push(v);
              if (arg.parameterIndex != null) callArgs[arg.parameterIndex] = v;
              else callArgs.push(v);
            } catch (err: any) {
              updateErrorMessage(
                err,
                `Failed to decode parameter ${i} of event "${event}": ${err.message}`,
              );
              throw err;
            }
            i++;
          }
          const resp = await reg.handler.apply(reg.contDef.instance, callArgs);
          if (callback) {
            let out: any;
            if (reg.encoder) out = reg.encoder(resp);
            if (!(resp instanceof OperationResult))
              out = this._operationResultEncoder({
                payload: out,
              });
            callback(out);
          }
        } catch (err: any) {
          if (callback) {
            const error =
              err instanceof OpraException ? err : new OpraException(err);
            const out = this._operationResultEncoder({
              errors: [error],
            });
            callback(out);
          }
        }
      });
    });
  }

  /**
   * Retrieves the controller instance for a given path.
   *
   * @param controllerPath - The path of the controller.
   * @returns The controller instance, or undefined if not found.
   */
  getControllerInstance<T>(controllerPath: string): T | undefined {
    const controller = this.api.findController(controllerPath);
    return controller && this._controllerInstances.get(controller);
  }
}

/**
 * Namespace for SocketioAdapter types and interfaces.
 */
export namespace SocketioAdapter {
  /**
   * Represents a callback for the next interceptor in the chain.
   */
  export type NextCallback = () => Promise<any>;

  /**
   * Configuration options for the SocketioAdapter.
   */
  export interface Options extends PlatformAdapter.Options {
    /** Interceptors to be executed for incoming messages. */
    interceptors?: (InterceptorFunction | IWSInterceptor)[];
    /** The scope to be used for encoding/decoding. */
    scope?: string;
  }

  /**
   * Function signature for a WebSocket interceptor.
   */
  export type InterceptorFunction = IWSInterceptor['intercept'];

  /**
   * Interface for a WebSocket interceptor.
   */
  export type IWSInterceptor = {
    /**
     * Intercepts an incoming WebSocket message.
     *
     * @param context - The Socketio context for the message.
     * @param next - The callback to invoke the next interceptor or handler.
     * @returns The result of the next interceptor or handler.
     */
    intercept(context: SocketioContext, next: NextCallback): Promise<any>;
  };

  /**
   * Event definitions for the SocketioAdapter.
   */
  export interface Events {
    /** Emitted when an error occurs. */
    error: [
      error: Error,
      socket: socketio.Socket | undefined,
      _this: SocketioAdapter,
    ];
    /** Emitted when a new socket connection is established. */
    connection: [socket: socketio.Socket, _this: SocketioAdapter];
    /** Emitted when a socket connection is closed. */
    close: [socket: socketio.Socket, _this: SocketioAdapter];
    /** Emitted when an operation is executed. */
    execute: [context: SocketioContext];
  }
}

/**
 * Internal interface for registering message handlers.
 */
interface MessageHandlerReg {
  event: string | RegExp;
  handler: Function;
  contDef: WSController;
  oprDef: WSOperation;
  decoders: ((data: any) => any)[];
  encoder?: (data: any) => any;
}
