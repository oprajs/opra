import zlib from 'node:zlib';
import typeIs from '@browsery/type-is';
import {
  ApiDocument,
  OpraException,
  OpraSchema,
  RPC_CONTROLLER_METADATA,
  RpcApi,
  RpcController,
  RpcOperation,
} from '@opra/common';
import { kAssetCache, PlatformAdapter } from '@opra/core';
import {
  type AmqpConnectionManager,
  AmqpConnectionManagerClass,
  type AmqpConnectionManagerOptions,
  type ChannelWrapper,
  type ConnectionUrl,
} from 'amqp-connection-manager';
import amqplib from 'amqplib';
import { ConsumeMessage } from 'amqplib/properties';
import { parse as parseContentType } from 'content-type';
import iconv from 'iconv-lite';
import { promisify } from 'util';
import { Validator, vg } from 'valgen';
import {
  RMQ_OPERATION_METADATA,
  RMQ_OPERATION_METADATA_RESOLVER,
} from './constants.js';
import { RabbitmqContext } from './rabbitmq-context.js';

const gunzipAsync = promisify(zlib.gunzip);
const deflateAsync = promisify(zlib.deflate);
const inflateAsync = promisify(zlib.inflate);
const brotliAsync = promisify(zlib.brotliCompress);

const globalErrorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
const noOp = () => undefined;

export interface OperationConfig {
  consumer: amqplib.Options.Consume & {};
}

interface HandlerArguments {
  consumer: amqplib.Options.Consume & {};
  controller: RpcController;
  instance: any;
  operation: RpcOperation;
  operationConfig: OperationConfig;
  handler: (
    channel: ChannelWrapper,
    queue: string,
    msg: ConsumeMessage | null,
  ) => void | Promise<void>;
  topics: string[];
}

/**
 *
 * @class RabbitmqAdapter
 */
export class RabbitmqAdapter extends PlatformAdapter<RabbitmqAdapter.Events> {
  static readonly PlatformName = 'rabbitmq';
  protected _config: RabbitmqAdapter.Config;
  protected _controllerInstances = new Map<RpcController, any>();
  protected _client?: AmqpConnectionManager;
  protected _status: RabbitmqAdapter.Status = 'idle';
  readonly protocol: OpraSchema.Transport = 'rpc';
  readonly platform = RabbitmqAdapter.PlatformName;
  readonly interceptors: (
    | RabbitmqAdapter.InterceptorFunction
    | RabbitmqAdapter.IRabbitmqInterceptor
  )[];

  /**
   *
   * @param document
   * @param config
   * @constructor
   */
  constructor(document: ApiDocument, config: RabbitmqAdapter.Config) {
    super(config);
    this._document = document;
    this._config = config;
    if (
      !(
        this.document.api instanceof RpcApi &&
        this.document.api.platform === RabbitmqAdapter.PlatformName
      )
    ) {
      throw new TypeError(`The document doesn't expose a RabbitMQ Api`);
    }
    // this._config = config;
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

  get api(): RpcApi {
    return this.document.rpcApi;
  }

  get scope(): string | undefined {
    return this._config.scope;
  }

  get status(): RabbitmqAdapter.Status {
    return this._status;
  }

  /**
   * Starts the service
   */
  async start() {
    if (this.status !== 'idle') return;
    this._status = 'starting';
    const handlerArgs: HandlerArguments[] = [];
    try {
      /** Initialize consumers */
      for (const controller of this.document.rpcApi.controllers.values()) {
        let instance = controller.instance;
        if (!instance && controller.ctor) instance = new controller.ctor();
        if (!instance) continue;
        this._controllerInstances.set(controller, instance);

        /** Build HandlerData array */
        for (const operation of controller.operations.values()) {
          const operationConfig = await this._getOperationConfig(
            controller,
            instance,
            operation,
          );
          if (!operationConfig) continue;
          const args: HandlerArguments = {
            consumer: null as any,
            controller,
            instance,
            operation,
            operationConfig,
            handler: null as any,
            topics: (Array.isArray(operation.channel)
              ? operation.channel
              : [operation.channel]
            ).map(String),
          };
          this._createHandler(args);
          handlerArgs.push(args);
        }
      }

      const connectionOptions: RabbitmqAdapter.ConnectionOptions =
        typeof this._config.connection === 'string'
          ? {
              urls: [this._config.connection],
            }
          : Array.isArray(this._config.connection)
            ? {
                urls: this._config.connection,
              }
            : this._config.connection;
      this._client = new AmqpConnectionManagerClass(
        connectionOptions.urls,
        connectionOptions,
      );
      this._client.connect().catch(e => {
        e.message =
          'Unable to connect to RabbitMQ server at ' +
          connectionOptions.urls +
          '. ' +
          e.message;
        throw e;
      });
      this.logger?.info?.(`Connected RabbitMQ at ${connectionOptions.urls}`);
      for (const args of handlerArgs) {
        /** Create channel per operation */
        this._client.createChannel({
          setup: async channel => {
            for (const topic of args.topics) {
              const opts = this._config.queues?.[topic];
              await channel.assertQueue(topic, opts);
              await channel
                .consume(
                  topic,
                  async (msg: ConsumeMessage | null) => {
                    if (!msg) return;
                    await this.emitAsync('message', msg, topic).catch(noOp);
                    try {
                      await args.handler(channel, topic, msg);
                    } catch (e) {
                      this._emitError(e);
                    }
                  },
                  /** Consume options */
                  args.operationConfig.consumer,
                )
                .catch(e => {
                  this._emitError(e);
                  throw e;
                });
              this.logger?.info?.(
                `Subscribed to topic${args.topics.length > 1 ? 's' : ''} "${args.topics}"`,
              );
            }
          },
        });
      }

      this._status = 'started';
    } catch (e) {
      await this.close();
      throw e;
    }
  }

  /**
   * Closes all connections and stops the service
   */
  async close() {
    await this._client?.close();
    this._client = undefined;
    this._controllerInstances.clear();
    this._status = 'idle';
  }

  getControllerInstance<T>(controllerPath: string): T | undefined {
    const controller = this.api.findController(controllerPath);
    return controller && this._controllerInstances.get(controller);
  }

  /**
   *
   * @param controller
   * @param instance
   * @param operation
   * @protected
   */
  protected async _getOperationConfig(
    controller: RpcController,
    instance: any,
    operation: RpcOperation,
  ): Promise<OperationConfig | undefined> {
    if (typeof instance[operation.name] !== 'function') return;
    const proto = controller.ctor?.prototype || Object.getPrototypeOf(instance);
    if (Reflect.hasMetadata(RPC_CONTROLLER_METADATA, proto, operation.name))
      return;
    const operationConfig: OperationConfig = {
      consumer: {
        noAck: true,
      },
    };
    if (this._config.defaults) {
      if (this._config.defaults.consumer) {
        Object.assign(operationConfig.consumer, this._config.defaults.consumer);
      }
    }

    let metadata = Reflect.getMetadata(
      RMQ_OPERATION_METADATA,
      proto,
      operation.name,
    ) as RabbitmqAdapter.OperationOptions;
    if (!metadata) {
      const configResolver = Reflect.getMetadata(
        RMQ_OPERATION_METADATA_RESOLVER,
        proto,
        operation.name,
      );
      if (configResolver) {
        metadata = await configResolver();
      }
    }
    if (metadata) {
      if (typeof metadata.consumer === 'object') {
        Object.assign(operationConfig.consumer, metadata.consumer);
      }
    }
    return operationConfig;
  }

  /**
   *
   * @param args
   * @protected
   */
  protected _createHandler(args: HandlerArguments) {
    const { controller, instance, operation } = args;
    /** Prepare parsers */
    const decodePayload = operation.payloadType?.generateCodec('decode', {
      scope: this.scope,
      ignoreWriteonlyFields: true,
    });
    operation.headers.forEach(header => {
      let decode = this[kAssetCache].get<Validator>(header, 'decode');
      if (!decode) {
        decode =
          header.type?.generateCodec('decode', {
            scope: this.scope,
            ignoreReadonlyFields: true,
          }) || vg.isAny();
        this[kAssetCache].set(header, 'decode', decode);
      }
    });

    args.handler = async (
      channel: ChannelWrapper,
      queue: string,
      message: ConsumeMessage | null,
    ) => {
      if (!message) return;
      const operationHandler = instance[operation.name] as Function;
      const headers: any = {};
      /** Create context */
      const context = new RabbitmqContext({
        adapter: this,
        platform: this.platform,
        controller,
        controllerInstance: instance,
        operation,
        operationHandler,
        queue,
        channel,
        message,
        content: undefined,
        headers,
      });
      try {
        /** Parse and decode `payload` */
        let content = await this._parseContent(message);
        if (content && decodePayload) {
          if (Buffer.isBuffer(content)) content = content.toString('utf-8');
          content = decodePayload(content);
        }
        // message.properties.
        /** Parse and decode `headers` */
        if (message.properties.headers) {
          for (const [k, v] of Object.entries(message.properties.headers)) {
            const header = operation.findHeader(k);
            const decode =
              this[kAssetCache].get<Validator>(header, 'decode') || vg.isAny();
            headers[k] = decode(Buffer.isBuffer(v) ? v.toString() : v);
          }
        }
        (context as any).content = content;
      } catch (e) {
        context.ack();
        this._emitError(e, context);
        return;
      }

      await this.emitAsync('execute', context).catch(noOp);
      try {
        /** Call operation handler */
        const result = await operationHandler.call(instance, context);
        await this.emitAsync('finish', context, result).catch(noOp);
      } catch (e: any) {
        this._emitError(e, context);
      }
    };
  }

  protected async _parseContent(msg: ConsumeMessage) {
    if (!msg.content?.length) return;
    let content: any = msg.content;
    if (msg.properties.contentEncoding) {
      switch (msg.properties.contentEncoding) {
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
    const mediaType =
      msg.properties.contentType &&
      parseContentType(msg.properties.contentType || '');
    let charset = (mediaType?.parameters.charset || '').toLowerCase();
    if (!charset && typeIs.is(mediaType?.type, ['json', 'xml', 'txt']))
      charset = 'utf-8';
    if (charset) {
      content = iconv.decode(content, charset) as any;
      if (typeIs.is(mediaType.type, ['json'])) return JSON.parse(content);
    }
    return content;
  }

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

  export type Status = 'idle' | 'starting' | 'started';

  export interface ConnectionOptions extends AmqpConnectionManagerOptions {
    urls?: ConnectionUrl[];
  }

  export interface Config extends PlatformAdapter.Options {
    connection: string | string[] | ConnectionOptions;
    queues?: Record<string, amqplib.Options.AssertQueue>;
    defaults?: {
      consumer?: amqplib.Options.Consume;
    };
    scope?: string;
    interceptors?: (InterceptorFunction | IRabbitmqInterceptor)[];
    logExtra?: boolean;
  }

  export interface OperationOptions {
    /**
     * ConsumerConfig
     */
    consumer?: amqplib.Options.Consume;
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
    error: [Error, RabbitmqContext | undefined];
    execute: [RabbitmqContext];
    finish: [RabbitmqContext, any];
    message: [ConsumeMessage, string];
  }
}
