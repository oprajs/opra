import { ApiDocument, OpraSchema, RpcApi, RpcController, RpcOperation } from '@opra/common';
import { type ILogger, kAssetCache, PlatformAdapter } from '@opra/core';
import { type Consumer, ConsumerConfig, EachMessageHandler, Kafka, type KafkaConfig, logLevel } from 'kafkajs';
import type { StrictOmit } from 'ts-gems';
import { Validator, vg } from 'valgen';
import { KAFKA_DEFAULT_GROUP, KAFKA_OPERATION_METADATA, KAFKA_OPERATION_METADATA_RESOLVER } from './constants.js';
import { KafkaContext } from './kafka-context.js';
import { RequestParser } from './request-parser.js';

const globalErrorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
const kGroupId = Symbol('kGroupId');

/**
 * @namespace KafkaAdapter
 */
export namespace KafkaAdapter {
  export type NextCallback = () => Promise<any>;

  export interface Config extends PlatformAdapter.Options {
    client: StrictOmit<KafkaConfig, 'logCreator' | 'logLevel'>;
    consumers?: Record<string, StrictOmit<ConsumerConfig, 'groupId'>>;
    document: ApiDocument;
    interceptors?: (InterceptorFunction | IKafkaInterceptor)[];
    logger?: ILogger;
    logExtra?: boolean;
  }

  export interface OperationOptions {
    /**
     * groupId or ConsumerConfig
     */
    consumer?: string | ConsumerConfig;
    fromBeginning?: boolean;
  }

  /**
   * @type InterceptorFunction
   */
  export type InterceptorFunction = IKafkaInterceptor['intercept'];

  /**
   * @interface IKafkaInterceptor
   */
  export type IKafkaInterceptor = {
    intercept(context: KafkaContext, next: NextCallback): Promise<any>;
  };
}

interface HandlerArguments {
  consumer: Consumer;
  controller: RpcController;
  instance: any;
  operation: RpcOperation;
  operationOptions: KafkaAdapter.OperationOptions;
  handler: EachMessageHandler;
  topics: (string | RegExp)[];
}

/**
 *
 * @class KafkaAdapter
 */
export class KafkaAdapter extends PlatformAdapter {
  static readonly PlatformName = 'kafka';
  protected _config: KafkaAdapter.Config;
  protected _controllerInstances = new Map<RpcController, any>();
  protected _consumers = new Map<string, Consumer>();
  protected _handlerArgs: HandlerArguments[] = [];
  protected _logger?: ILogger;
  readonly kafka: Kafka;
  readonly protocol: OpraSchema.Transport = 'rpc';
  readonly platform = KafkaAdapter.PlatformName;
  interceptors: (KafkaAdapter.InterceptorFunction | KafkaAdapter.IKafkaInterceptor)[];

  /**
   *
   * @param config
   * @constructor
   */
  constructor(config: KafkaAdapter.Config) {
    super(config.document, config);
    if (!(config.document.api instanceof RpcApi && config.document.api.platform === KafkaAdapter.PlatformName)) {
      throw new TypeError(`The document doesn't expose a Kafka Api`);
    }
    this._config = config;
    this.interceptors = [...(config.interceptors || [])];
    this.kafka = new Kafka({
      ...config.client,
      logCreator: config.logger ? () => this._createLogCreator(config.logger!, config.logExtra) : undefined,
    });
    this._logger = config.logger;
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

  /**
   * Starts the service
   */
  async start() {
    /* istanbul ignore next */
    if (this._consumers.size > 0) return;
    /* istanbul ignore next */
    if (this._consumers.size > 0) return;
    await this._createAllConsumers();

    /** Connect all consumers */
    for (const consumer of this._consumers.values()) {
      await consumer.connect().catch(e => {
        this._emitError(e);
        throw e;
      });
    }

    /** Subscribe to channels */
    for (const args of this._handlerArgs) {
      const { consumer, operation, operationOptions } = args;
      args.topics = Array.isArray(operation.channel) ? operation.channel : [operation.channel];
      await consumer.subscribe({ topics: args.topics, fromBeginning: operationOptions.fromBeginning }).catch(e => {
        this._emitError(e);
        throw e;
      });
      this.logger?.info?.(`Subscribed to topic${args.topics.length > 1 ? 's' : ''} "${args.topics}"`);
    }

    /** Start consumer listeners */
    const topicMap = new Map<string, HandlerArguments[]>();
    for (const consumer of this._consumers.values()) {
      const groupId: string = consumer[kGroupId];
      await consumer
        .run({
          eachMessage: async payload => {
            await this.emitAsync('message', payload);
            const { topic } = payload;
            const topicCacheKey = groupId + ':' + topic;
            let handlerArgsArray = topicMap.get(topicCacheKey);
            if (!handlerArgsArray) {
              handlerArgsArray = this._handlerArgs.filter(
                args =>
                  args.consumer === consumer &&
                  args.topics.find(t => (t instanceof RegExp ? t.test(topic) : t === topic)),
              );
              /* istanbul ignore next */
              if (!handlerArgsArray) {
                this._emitError(new Error(`Unhandled topic (${topic})`));
                return;
              }
              topicMap.set(topicCacheKey, handlerArgsArray);
            }
            /** Iterate and call all matching handlers */
            for (const args of handlerArgsArray) {
              try {
                await args.handler(payload);
              } catch (e) {
                this._emitError(e);
              }
            }
            await this.emitAsync('message-finish', payload);
          },
        })
        .catch(e => {
          this._emitError(e);
          throw e;
        });
    }
  }

  /**
   * Closes all connections and stops the service
   */
  async close() {
    await Promise.allSettled(Array.from(this._consumers.values()).map(c => c.disconnect()));
    this._consumers.clear();
    this._controllerInstances.clear();
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
  protected async _getOperationOptions(
    controller: RpcController,
    instance: any,
    operation: RpcOperation,
  ): Promise<KafkaAdapter.OperationOptions | undefined> {
    if (typeof instance[operation.name] !== 'function') return;
    const proto = controller.ctor?.prototype || Object.getPrototypeOf(instance);
    let operationOptions: KafkaAdapter.OperationOptions | undefined = Reflect.getMetadata(
      KAFKA_OPERATION_METADATA,
      proto,
      operation.name,
    );
    const configResolver = Reflect.getMetadata(KAFKA_OPERATION_METADATA_RESOLVER, proto, operation.name);
    if (configResolver) {
      const cfg = await configResolver();
      operationOptions = { ...operationOptions, ...cfg };
    }
    return operationOptions;
  }

  /**
   *
   * @protected
   */
  protected async _createAllConsumers() {
    for (const controller of this.document.rpcApi.controllers.values()) {
      let instance = controller.instance;
      if (!instance && controller.ctor) instance = new controller.ctor();
      if (!instance) continue;
      this._controllerInstances.set(controller, instance);

      /** Build HandlerData array */
      for (const operation of controller.operations.values()) {
        const operationOptions = await this._getOperationOptions(controller, instance, operation);
        if (!operationOptions) continue;
        // const consumerConfig = this._getConsumerConfig(operationOptions);
        const args: HandlerArguments = {
          consumer: null as any,
          controller,
          instance,
          operation,
          operationOptions,
          handler: null as any,
          topics: null as any,
        };
        this._createHandler(args);
        this._handlerArgs.push(args);
      }
    }

    /** Initialize consumers */
    for (const args of this._handlerArgs) {
      await this._createConsumer(args);
    }
  }

  /**
   *
   * @param args
   * @protected
   */
  protected async _createConsumer(args: HandlerArguments) {
    const { operationOptions } = args;
    const consumerConfig: ConsumerConfig = {
      groupId: KAFKA_DEFAULT_GROUP,
    };
    let consumer: Consumer | undefined;
    if (typeof operationOptions.consumer === 'object') {
      consumer = this._consumers.get(operationOptions.consumer.groupId);
      if (consumer) {
        throw new Error(`Operation consumer for groupId (${operationOptions.consumer.groupId}) already exists`);
      }
      Object.assign(consumerConfig, operationOptions.consumer);
    } else if (operationOptions.consumer) {
      const x = this._config.consumers?.[operationOptions.consumer];
      Object.assign(consumerConfig, { ...x, groupId: operationOptions.consumer });
    }
    consumer = this._consumers.get(consumerConfig.groupId);

    /** Create consumers */
    if (!consumer) {
      consumer = this.kafka.consumer(consumerConfig);
      consumer[kGroupId] = consumerConfig.groupId;
      this._consumers.set(consumerConfig.groupId, consumer);
    }
    args.consumer = consumer;
  }

  /**
   *
   * @param args
   * @protected
   */
  protected _createHandler(args: HandlerArguments) {
    const { controller, instance, operation } = args;
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

    args.handler = async ({ topic, partition, message, heartbeat, pause }) => {
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

      await this.emitAsync('before-execute', ctx);
      const result = await operationHandler.call(instance, ctx);
      await this.emitAsync('after-execute', ctx, result);
    };
  }

  protected _emitError(e: any) {
    this._logger?.error(e);
    if (this.listenerCount('error')) this.emit('error', e);
  }

  protected _createLogCreator(logger: ILogger, logExtra?: boolean) {
    return ({ namespace, level, log }) => {
      const { message, error, ...extra } = log;
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
      if (!logExtra) return fn.call(logger, error || message);
      return fn.call(logger, error || message, {
        ...extra,
        namespace,
      });
    };
  }
}
