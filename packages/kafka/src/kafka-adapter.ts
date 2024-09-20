import { ApiDocument, MsgApi, MsgController, MsgOperation, OpraSchema } from '@opra/common';
import { type ILogger, kAssetCache, PlatformAdapter } from '@opra/core';
import { type Consumer, Kafka, type KafkaConfig, logLevel } from 'kafkajs';
import type { StrictOmit } from 'ts-gems';
import { Validator, vg } from 'valgen';
import { KAFKA_DEFAULT_GROUP, KAFKA_OPERATION_METADATA, KAFKA_OPERATION_METADATA_RESOLVER } from './constants.js';
import { KafkaContext } from './kafka-context.js';
import { RequestParser } from './request-parser.js';
import type { KafkaOperationOptions } from './types.js';

const globalErrorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

/**
 *
 * @class KafkaAdapter
 */
export class KafkaAdapter extends PlatformAdapter {
  protected _controllerInstances = new Map<MsgController, any>();
  protected _consumers = new Map<
    Consumer,
    {
      consumer: Consumer;
      controller: MsgController;
      instance: any;
      operation: MsgOperation;
      options: KafkaOperationOptions;
    }
  >();
  protected _logger?: ILogger;
  readonly kafka: Kafka;
  readonly protocol: OpraSchema.Transport = 'msg';
  readonly platform = KafkaAdapter.PlatformName;
  interceptors: (KafkaAdapter.InterceptorFunction | KafkaAdapter.IKafkaInterceptor)[];

  /**
   *
   * @param init
   * @constructor
   */
  constructor(init: KafkaAdapter.InitArguments) {
    super(init.document, init);
    if (!(init.document.api instanceof MsgApi && init.document.api.platform === KafkaAdapter.PlatformName)) {
      throw new TypeError(`The document doesn't expose a Kafka Api`);
    }
    this.interceptors = [...(init.interceptors || [])];
    this.kafka = new Kafka({
      ...init,
      logCreator: init.logger ? () => this._createLogCreator(init.logger!) : undefined,
    });
    this._logger = init.logger;
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

  get api(): MsgApi {
    return this.document.msgApi;
  }

  /**
   * Starts the service
   */
  async start() {
    /* istanbul ignore next */
    if (this._consumers.size > 0) return;
    await this._initConsumers();
    return this._start();
  }

  /**
   * Closes all connections and stops the service
   */
  async close() {
    for (const [controller, instance] of this._controllerInstances.entries()) {
      if (controller.onShutdown) {
        try {
          await controller.onShutdown.call(instance, controller);
        } catch (e) {
          this._emitError(e);
        }
      }
    }
    await Promise.allSettled(Array.from(this._consumers.keys()).map(c => c.disconnect()));
    this._consumers.clear();
    this._controllerInstances.clear();
  }

  getControllerInstance<T>(controllerPath: string): T | undefined {
    const controller = this.api.findController(controllerPath);
    return controller && this._controllerInstances.get(controller);
  }

  /**
   * Creates and initializes all consumers
   *
   * @protected
   */
  protected async _initConsumers() {
    /* istanbul ignore next */
    if (this._consumers.size > 0) return;
    /** Create consumers */
    for (const controller of this.document.msgApi.controllers.values()) {
      let instance = controller.instance;
      if (!instance && controller.ctor) instance = new controller.ctor();
      if (!instance) continue;
      for (const operation of controller.operations.values()) {
        await this._initConsumer(controller, instance, operation);
      }
      this._controllerInstances.set(controller, instance);
    }
  }

  /**
   * Creates and initializes a consumer for given operation
   *
   * @protected
   */
  protected async _initConsumer(controller: MsgController, instance: any, operation: MsgOperation) {
    if (typeof instance[operation.name] !== 'function') return;
    const proto = controller.ctor?.prototype || Object.getPrototypeOf(controller.instance);
    let operationOptions: KafkaOperationOptions | undefined = Reflect.getMetadata(
      KAFKA_OPERATION_METADATA,
      proto,
      operation.name,
    );
    const configResolver = Reflect.getMetadata(KAFKA_OPERATION_METADATA_RESOLVER, proto, operation.name);
    if (configResolver) {
      const cfg = await configResolver();
      operationOptions = { ...operationOptions, ...cfg };
    }
    const groupId = operationOptions?.groupId || KAFKA_DEFAULT_GROUP;
    const options = { ...operationOptions, groupId };
    const consumer = this.kafka.consumer(options);
    this._consumers.set(consumer, { consumer, controller, instance, operation, options });
    if (typeof controller.onInit === 'function') controller.onInit.call(instance, controller);
  }

  protected async _start() {
    const arr = Array.from(this._consumers.values());
    if (!arr.length) return;
    /** Start first consumer to test if server is available */
    await this._startConsumer(arr.shift()!);
    /** if first connection is success than start all consumers at same time */
    await Promise.allSettled(arr.map(x => this._startConsumer(x)));
  }

  /**
   * Starts all consumers
   * @protected
   */
  protected async _startConsumer(args: {
    consumer: Consumer;
    controller: MsgController;
    instance: any;
    operation: MsgOperation;
    options: KafkaOperationOptions;
  }) {
    const { consumer, controller, instance, operation, options } = args;
    /** Prepare parsers */
    const parseKey = RequestParser.STRING;
    const parsePayload = RequestParser.STRING;
    /** Prepare decoders */
    const decodeKey = operation.keyType?.generateCodec('decode', { ignoreWriteonlyFields: true }) || vg.isAny();
    const decodePayload = operation.payloadType?.generateCodec('decode', { ignoreWriteonlyFields: true }) || vg.isAny();
    operation.headers.forEach(header => {
      let decode = this[kAssetCache].get<Validator>(header, 'decode');
      if (!decode) {
        decode = header.type?.generateCodec('decode', { ignoreReadonlyFields: true }) || vg.isAny();
        this[kAssetCache].set(header, 'decode', decode);
      }
    });
    /** Connect to Kafka server */
    await consumer.connect().catch(e => {
      this._emitError(e);
      throw e;
    });
    /** Subscribe to channels */
    if (Array.isArray(operation.channel)) {
      await consumer.subscribe({ topics: operation.channel, fromBeginning: options.fromBeginning }).catch(e => {
        this._emitError(e);
        throw e;
      });
    } else {
      await consumer.subscribe({ topic: operation.channel, fromBeginning: options.fromBeginning }).catch(e => {
        this._emitError(e);
        throw e;
      });
    }
    /** Run message listener */
    await consumer
      .run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
          const operationHandler = instance[operation.name] as Function;
          let key: any;
          let payload: any;
          const headers: any = {};
          try {
            /** Parse and decode `key` */
            if (message.key) {
              const s = parseKey(message.key);
              key = decodeKey(s);
            }
            /** Parse and decode `payload` */
            if (message.value != null) {
              const s = parsePayload(message.value);
              payload = decodePayload(s);
            }
            /** Parse and decode `headers` */
            if (message.headers) {
              for (const [k, v] of Object.entries(message.headers)) {
                const header = operation.findHeader(k);
                const decode = this[kAssetCache].get<Validator>(header, 'decode') || vg.isAny();
                headers[k] = decode(Buffer.isBuffer(v) ? v.toString() : v);
              }
            }
          } catch (e) {
            this._emitError(e);
            return;
          }
          /** Create context */
          const ctx = new KafkaContext({
            adapter: this,
            platform: this.platform,
            controller,
            controllerInstance: instance,
            operation,
            operationHandler,
            topic,
            partition,
            payload,
            key,
            headers,
            rawMessage: message,
            heartbeat,
            pause,
          });
          await this.emitAsync('createContext', ctx);

          await operationHandler(ctx);
        },
      })
      .catch(e => {
        this._emitError(e);
        throw e;
      });
  }

  protected _emitError(e: any) {
    this._logger?.error(e);
    if (this.listenerCount('error')) this.emit('error', e);
  }

  protected _createLogCreator(logger: ILogger, logExtra?: boolean) {
    return ({ namespace, level, log }) => {
      const { message, ...extra } = log;
      delete extra.namespace;
      delete extra.timestamp;
      delete extra.logger;
      let fn: Function | undefined;
      switch (level) {
        case logLevel.ERROR:
          fn = logger.error || logger.info;
          break;
        case logLevel.WARN:
          fn = logger.warn || logger.info;
          break;
        case logLevel.DEBUG:
          fn = logger.debug;
          break;
        case logLevel.NOTHING:
          break;
        default:
          fn = logger.info;
          break;
      }
      if (!fn) return;
      if (!logExtra) return fn(message);
      return fn(message, {
        ...extra,
        namespace,
      });
    };
  }
}

/**
 * @namespace KafkaAdapter
 */
export namespace KafkaAdapter {
  export const PlatformName = 'kafka';

  export type NextCallback = () => Promise<void>;

  export interface InitArguments extends StrictOmit<KafkaConfig, 'logCreator' | 'logLevel'>, PlatformAdapter.Options {
    document: ApiDocument;
    interceptors?: (InterceptorFunction | IKafkaInterceptor)[];
    logger?: ILogger;
    logExtra?: boolean;
  }

  /**
   * @type InterceptorFunction
   */
  export type InterceptorFunction = IKafkaInterceptor['intercept'];

  /**
   * @interface IKafkaInterceptor
   */
  export type IKafkaInterceptor = {
    intercept(context: KafkaContext, next: NextCallback): Promise<void>;
  };
}
