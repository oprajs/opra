import zlib from 'node:zlib';
import typeIs from '@browsery/type-is';
import { updateErrorMessage } from '@jsopen/objects';
import {
  ApiDocument,
  MQApi,
  MQController,
  OpraException,
  OpraSchema,
} from '@opra/common';
import { kAssetCache, PlatformAdapter } from '@opra/core';
import { parse as parseContentType } from 'content-type';
import iconv from 'iconv-lite';
import * as rabbit from 'rabbitmq-client';
import type { Envelope, MessageBody } from 'rabbitmq-client/lib/codec.js';
import { promisify } from 'util';
import { Validator, vg } from 'valgen';
import { ConfigBuilder } from './config-builder.js';
import { RabbitmqContext } from './rabbitmq-context.js';

const gunzipAsync = promisify(zlib.gunzip);
const deflateAsync = promisify(zlib.deflate);
const inflateAsync = promisify(zlib.inflate);
const brotliAsync = promisify(zlib.brotliCompress);

const globalErrorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
const noOp = () => undefined;

/**
 * RabbitMQ platform adapter for Opra.
 *
 * This adapter handles communication with RabbitMQ, including connection management,
 * queue subscription, message parsing, and operation execution.
 */
export class RabbitmqAdapter extends PlatformAdapter<RabbitmqAdapter.Events> {
  static readonly PlatformName = 'rabbitmq';
  protected _config: RabbitmqAdapter.Config;
  protected _controllerInstances = new Map<MQController, any>();
  protected _connection?: rabbit.Connection;
  protected _consumers: rabbit.Consumer[] = [];
  protected _status: RabbitmqAdapter.Status = 'idle';
  readonly transform: OpraSchema.Transport = 'mq';
  readonly platform = RabbitmqAdapter.PlatformName;
  readonly interceptors: (
    | RabbitmqAdapter.InterceptorFunction
    | RabbitmqAdapter.IRabbitmqInterceptor
  )[];

  /**
   * Initializes a new instance of the RabbitmqAdapter.
   *
   * @param document - The API document instance.
   * @param config - Configuration options for the RabbitMQ adapter.
   * @throws {@link TypeError} Throws if the document does not expose a RabbitMQ API.
   */
  constructor(document: ApiDocument, config: RabbitmqAdapter.Config) {
    super(config);
    this._document = document;
    this._config = config;
    if (
      !(
        this.document.api instanceof MQApi &&
        this.document.api.platform === RabbitmqAdapter.PlatformName
      )
    ) {
      throw new TypeError(`The document doesn't expose a RabbitMQ Api`);
    }
    this.interceptors = [...(config.interceptors || [])];
    globalErrorTypes.forEach(type => {
      process.on(type, e => {
        this._emitError(e);
        return this.close();
      });
    });
    signalTraps.forEach(type => {
      process.once(type, () => this.close());
    });
  }

  /**
   * Gets the MQ API instance associated with this adapter.
   */
  get api(): MQApi {
    return this.document.getMqApi();
  }

  /**
   * Gets the active RabbitMQ connection, if any.
   */
  get connection(): rabbit.Connection | undefined {
    return this._connection;
  }

  /**
   * Gets the optional scope for this adapter.
   */
  get scope(): string | undefined {
    return this._config.scope;
  }

  /**
   * Gets the current status of the adapter.
   */
  get status(): RabbitmqAdapter.Status {
    return this._status;
  }

  /**
   * Starts the RabbitMQ service by establishing a connection and subscribing to queues.
   *
   * @returns A promise that resolves when the service has started.
   * @throws {@link Error} Throws if the connection or subscription fails.
   */
  async start() {
    if (this.status !== 'idle') return;
    this._status = 'starting';
    // const handlerArgs: HandlerArguments[] = [];
    const configBuilder = new ConfigBuilder(this.document, this._config);
    await configBuilder.build();
    this._connection = new rabbit.Connection(configBuilder.connectionOptions);
    try {
      /* Establish connection */
      await this._connection.onConnect().catch(e => {
        updateErrorMessage(e, `RabbitMQ connection error. ${e.message}`);
        throw e;
      });
      this.logger?.info?.(
        `Connected RabbitMQ at ${configBuilder.connectionOptions.urls}`,
      );

      /* Subscribe to queues */
      const promises: Promise<void>[] = [];
      for (const args of configBuilder.handlerArgs) {
        for (const queue of args.topics) {
          const handler = this._createHandler(args);
          promises.push(
            new Promise<void>((resolve, reject) => {
              const consumer = this._connection!.createConsumer(
                {
                  ...args.consumerConfig,
                  queueOptions: {
                    ...args.consumerConfig.queueOptions,
                    durable: args.consumerConfig.queueOptions?.durable ?? true,
                  },
                  queue,
                },
                async (msg, reply) => {
                  await this.emitAsync('message', msg, queue).catch(noOp);
                  try {
                    await handler(consumer, queue, msg, reply);
                  } catch (e) {
                    this._emitError(e);
                  }
                },
              );
              this._consumers.push(consumer);
              consumer.on('ready', () => {
                this.logger?.info?.(`Subscribed to topic "${queue}"`);
                resolve();
              });
              consumer.on('error', (err: any) => {
                updateErrorMessage(
                  err,
                  `Consumer error (${queue})". ${err.message}`,
                );
                err.queue = queue;
                reject(err);
              });
            }),
          );
        }
      }
      await Promise.all(promises);
      this._status = 'started';
    } catch (err) {
      this._emitError(err);
      await this.close();
    }
  }

  /**
   * Closes all connections and stops the service.
   *
   * @returns A promise that resolves when all connections are closed.
   */
  async close() {
    if (this._consumers.length)
      await Promise.allSettled(
        this._consumers.map(consumer => consumer.close()),
      );
    await this._connection?.close();
    this._connection = undefined;
    this._consumers = [];
    this._controllerInstances.clear();
    this._status = 'idle';
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

  /**
   * Creates a message handler for a specific operation.
   *
   * @param args - Arguments required to create the handler.
   * @returns A function that processes incoming RabbitMQ messages.
   * @protected
   */
  protected _createHandler(args: ConfigBuilder.OperationArguments) {
    const { controller, instance, operation } = args;
    /* Prepare parsers */
    const decodePayload = operation.generateCodec('decode', {
      scope: this.scope,
      ignoreReadonlyFields: true,
    });
    operation.headers.forEach(header => {
      let decode = this[kAssetCache].get<Validator>(header, 'decode');
      if (!decode) {
        decode = header.generateCodec('decode', {
          scope: this.scope,
          ignoreReadonlyFields: true,
        });
        this[kAssetCache].set(header, 'decode', decode);
      }
    });

    return async (
      consumer: rabbit.Consumer,
      queue: string,
      message: rabbit.AsyncMessage,
      _reply: RabbitmqAdapter.ReplyFunction,
    ) => {
      if (!message) return;
      const operationHandler = instance[operation.name] as Function;
      let replyCalled = false;
      const reply: RabbitmqAdapter.ReplyFunction = async (
        body: MessageBody,
        envelope?: Envelope,
      ) => {
        if (replyCalled) return;
        replyCalled = true;
        return _reply(body, envelope);
      };
      const headers: any = {};
      /* Create context */
      const context = new RabbitmqContext({
        __adapter: this,
        __contDef: controller,
        __controller: instance,
        __oprDef: operation,
        __handler: operationHandler,
        queue,
        consumer,
        message,
        content: undefined,
        headers,
        reply,
      });
      try {
        /* Parse and decode `payload` */
        let content = await this._parseContent(message);
        if (content && decodePayload) {
          if (Buffer.isBuffer(content)) content = content.toString('utf-8');
          content = decodePayload(content);
        }
        // message.properties.
        /* Parse and decode `headers` */
        if (message.headers) {
          for (const [k, v] of Object.entries(message.headers)) {
            const header = operation.findHeader(k);
            const decode =
              this[kAssetCache].get<Validator>(header, 'decode') || vg.isAny();
            headers[k] = decode(Buffer.isBuffer(v) ? v.toString() : v);
          }
        }
        (context as any).content = content;
      } catch (e) {
        this._emitError(e, context);
        return;
      }

      await this.emitAsync('execute', context).catch(noOp);
      try {
        /* Call operation handler */
        const result = await operationHandler.call(instance, context);
        if (result !== undefined) await reply(result);
        await this.emitAsync('finish', context, result).catch(noOp);
      } catch (e: any) {
        this._emitError(e, context);
      }
    };
  }

  /**
   * Parses the content of a RabbitMQ message, handling encodings like gzip, deflate, and brotli.
   *
   * @param msg - The message to parse.
   * @returns The parsed content, which may be a string, buffer, or object.
   * @protected
   */
  protected async _parseContent(msg: rabbit.AsyncMessage) {
    if (!Buffer.isBuffer(msg.body)) return msg.body;
    if (!msg.body?.length) return;
    let content: any = msg.body;
    if (msg.contentEncoding) {
      switch (msg.contentEncoding) {
        case 'gzip':
        case 'x-gzip': {
          content = await gunzipAsync(content);
          break;
        }
        case 'deflate':
        case 'x-deflate': {
          content = await deflateAsync(content);
          break;
        }
        case 'inflate':
        case 'x-inflate': {
          content = await inflateAsync(content);
          break;
        }
        case 'br': {
          content = await brotliAsync(content);
          break;
        }
        case 'base64': {
          content = content.toString('base64');
          break;
        }
      }
    }
    const mediaType = msg.contentType
      ? parseContentType(msg.contentType || '')
      : undefined;
    if (mediaType && typeIs.is(mediaType.type, ['json', 'xml', 'txt'])) {
      const charset =
        (mediaType.parameters.charset || '').toLowerCase() || 'utf-8';
      content = iconv.decode(content, charset) as any;
      if (typeIs.is(mediaType.type, ['json'])) return JSON.parse(content);
    }
    return content;
  }

  /**
   * Emits an error event and logs the error.
   *
   * @param error - The error to emit.
   * @param context - The RabbitMQ context associated with the error.
   * @protected
   */
  protected _emitError(error: any, context?: RabbitmqContext) {
    Promise.resolve()
      .then(async () => {
        const logger = this.logger;
        if (context) {
          if (!context.errors.length) context.errors.push(error);
          context.errors = this._wrapExceptions(context.errors);
          if (context.listenerCount('error')) {
            await context
              .emitAsync('error', context.errors[0], context)
              .catch(noOp);
          }
          if (logger?.error) {
            context.errors.forEach(err => logger.error(err));
          }
        } else logger?.error(error);
        if (this.listenerCount('error')) this._emitError(error, context);
      })
      .catch(noOp);
  }

  /**
   * Wraps exceptions into OpraException instances.
   *
   * @param exceptions - An array of exceptions to wrap.
   * @returns An array of OpraException instances.
   * @protected
   */
  protected _wrapExceptions(exceptions: any[]): OpraException[] {
    const wrappedErrors = exceptions.map(e =>
      e instanceof OpraException ? e : new OpraException(e),
    );
    if (!wrappedErrors.length)
      wrappedErrors.push(new OpraException('Internal Server Error'));
    return wrappedErrors;
  }
}

/**
 * @namespace RabbitmqAdapter
 */
export namespace RabbitmqAdapter {
  export type NextCallback = () => Promise<any>;

  export type ReplyFunction = (
    body: MessageBody,
    envelope?: Envelope,
  ) => Promise<void>;

  export type Status = 'idle' | 'starting' | 'started';

  export interface ConnectionOptions extends Pick<
    rabbit.ConnectionOptions,
    | 'username'
    | 'password'
    | 'acquireTimeout'
    | 'connectionName'
    | 'connectionTimeout'
    | 'frameMax'
    | 'heartbeat'
    | 'maxChannels'
    | 'retryHigh'
    | 'retryLow'
    | 'noDelay'
    | 'tls'
    | 'socket'
  > {
    urls?: string[];
  }

  export interface ConsumerConfig extends Pick<
    rabbit.ConsumerProps,
    | 'concurrency'
    | 'requeue'
    | 'qos'
    | 'queueOptions'
    | 'exchanges'
    | 'exchangeBindings'
    | 'exclusive'
  > {}

  export interface Config extends PlatformAdapter.Options {
    connection?: string | string[] | ConnectionOptions;
    defaults?: {
      consumer?: ConsumerConfig;
    };
    scope?: string;
    interceptors?: (InterceptorFunction | IRabbitmqInterceptor)[];
    logExtra?: boolean;
  }

  /**
   * @type InterceptorFunction
   */
  export type InterceptorFunction = IRabbitmqInterceptor['intercept'];

  /**
   * @interface IRabbitmqInterceptor
   */
  export type IRabbitmqInterceptor = {
    intercept(context: RabbitmqContext, next: NextCallback): Promise<any>;
  };

  export interface Events {
    error: [error: Error, context: RabbitmqContext | undefined];
    execute: [context: RabbitmqContext];
    finish: [context: RabbitmqContext, result: any];
    message: [message: rabbit.AsyncMessage, queue: string];
  }
}
