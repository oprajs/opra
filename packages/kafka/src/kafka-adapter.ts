import {
  ApiDocument,
  OpraException,
  OpraSchema,
  RPC_CONTROLLER_METADATA,
  RpcApi,
  RpcController,
  RpcOperation,
} from '@opra/common';
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
const noOp = () => undefined;

/**
 * @namespace KafkaAdapter
 */
export namespace KafkaAdapter {
  export type NextCallback = () => Promise<any>;

  export interface Config extends PlatformAdapter.Options {
    client: StrictOmit<KafkaConfig, 'logCreator' | 'logLevel'>;
    consumers?: Record<string, StrictOmit<ConsumerConfig, 'groupId'>>;
    defaults?: {
      consumer?: ConsumerConfig;
      subscribe?: {
        fromBeginning?: boolean;
      };
    };
    interceptors?: (InterceptorFunction | IKafkaInterceptor)[];
    logExtra?: boolean;
  }

  export interface OperationOptions {
    /**
     * groupId or ConsumerConfig
     */
    consumer?: string | ConsumerConfig;
    subscribe?: {
      fromBeginning?: boolean;
    };
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

export interface OperationConfig {
  consumer: ConsumerConfig;
  selfConsumer?: boolean;
  subscribe?: KafkaAdapter.OperationOptions['subscribe'];
}

interface HandlerArguments {
  consumer: Consumer;
  controller: RpcController;
  instance: any;
  operation: RpcOperation;
  operationConfig: OperationConfig;
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
  protected _started = false;
  protected declare _kafka: Kafka;
  readonly protocol: OpraSchema.Transport = 'rpc';
  readonly platform = KafkaAdapter.PlatformName;
  readonly interceptors: (KafkaAdapter.InterceptorFunction | KafkaAdapter.IKafkaInterceptor)[];

  /**
   *
   * @param config
   * @constructor
   */
  constructor(config: KafkaAdapter.Config) {
    super(config);
    this._config = config;
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

  get kafka(): Kafka {
    return this._kafka;
  }

  async initialize(document: ApiDocument) {
    if (this._document) throw new TypeError(`${this.constructor.name} already initialized.`);
    if (!(document.api instanceof RpcApi && document.api.platform === KafkaAdapter.PlatformName)) {
      throw new TypeError(`The document doesn't expose a Kafka Api`);
    }
    this._document = document;
    this._kafka = new Kafka({
      ...this._config.client,
      logCreator: this.logger ? () => this._createLogCreator(this.logger!, this._config.logExtra) : undefined,
    });

    await this._createAllConsumers();
  }

  /**
   * Starts the service
   */
  async start() {
    if (this._started) return;
    this._started = true;
    /** Connect all consumers */
    for (const consumer of this._consumers.values()) {
      await consumer.connect().catch(e => {
        this._emitError(e);
        throw e;
      });
    }

    /** Subscribe to channels */
    for (const args of this._handlerArgs) {
      const { consumer, operation, operationConfig } = args;
      args.topics = Array.isArray(operation.channel) ? operation.channel : [operation.channel];
      await consumer
        .subscribe({
          ...operationConfig.subscribe,
          topics: args.topics,
        })
        .catch(e => {
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
            await this.emitAsync('message', payload).catch(() => undefined);
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
  protected async _getOperationConfig(
    controller: RpcController,
    instance: any,
    operation: RpcOperation,
  ): Promise<OperationConfig | undefined> {
    if (typeof instance[operation.name] !== 'function') return;
    const proto = controller.ctor?.prototype || Object.getPrototypeOf(instance);
    if (Reflect.hasMetadata(RPC_CONTROLLER_METADATA, proto, operation.name)) return;
    const operationConfig: OperationConfig = {
      consumer: {
        groupId: KAFKA_DEFAULT_GROUP,
      },
      subscribe: {},
    };
    if (this._config.defaults) {
      if (this._config.defaults.subscribe) {
        Object.assign(operationConfig.subscribe!, this._config.defaults.subscribe);
      }
      if (this._config.defaults.consumer) {
        Object.assign(operationConfig.consumer, this._config.defaults.consumer);
      }
    }

    let kafkaMetadata = Reflect.getMetadata(
      KAFKA_OPERATION_METADATA,
      proto,
      operation.name,
    ) as KafkaAdapter.OperationOptions;
    if (!kafkaMetadata) {
      const configResolver = Reflect.getMetadata(KAFKA_OPERATION_METADATA_RESOLVER, proto, operation.name);
      if (configResolver) {
        kafkaMetadata = await configResolver();
      }
    }
    if (kafkaMetadata) {
      if (kafkaMetadata.subscribe) {
        Object.assign(operationConfig.subscribe!, kafkaMetadata.subscribe);
      }
      if (kafkaMetadata.consumer) {
        if (typeof kafkaMetadata.consumer === 'object') {
          Object.assign(operationConfig.consumer, kafkaMetadata.consumer);
          operationConfig.selfConsumer = true;
        } else {
          const x = this._config.consumers?.[kafkaMetadata.consumer];
          if (x) {
            operationConfig.consumer.groupId = kafkaMetadata.consumer;
            Object.assign(operationConfig.consumer, x);
          }
        }
      }
    }
    return operationConfig;
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
        const operationConfig = await this._getOperationConfig(controller, instance, operation);
        if (!operationConfig) continue;
        const args: HandlerArguments = {
          consumer: null as any,
          controller,
          instance,
          operation,
          operationConfig,
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
    const { operationConfig } = args;
    let consumer = this._consumers.get(operationConfig.consumer.groupId);
    if (consumer && operationConfig.selfConsumer) {
      throw new Error(`Operation consumer for groupId (${operationConfig.consumer.groupId}) already exists`);
    }
    /** Create consumers */
    if (!consumer) {
      consumer = this.kafka.consumer(operationConfig.consumer);
      consumer[kGroupId] = operationConfig.consumer.groupId;
      this._consumers.set(operationConfig.consumer.groupId, consumer);
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
      const context = new KafkaContext({
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

      await this.emitAsync('before-execute', context);
      try {
        /** Call operation handler */
        const result = await operationHandler.call(instance, context);
        await this.emitAsync('after-execute', context, result);
      } catch (e: any) {
        this._emitError(e, context);
      }
    };
  }

  protected _emitError(error: any, context?: KafkaContext) {
    Promise.resolve()
      .then(async () => {
        const logger = this.logger;
        if (context) {
          if (!context.errors.length) context.errors.push(error);
          context.errors = this._wrapExceptions(context.errors);
          if (context.listenerCount('error')) {
            await this.emitAsync('error', context.errors[0], context);
          }
          if (logger?.error) {
            context.errors.forEach(err => logger.error(err));
          }
          return;
        }
        this.logger?.error(error);
        if (this.listenerCount('error')) this.emit('error', error);
      })
      .catch(noOp);
  }

  protected _wrapExceptions(exceptions: any[]): OpraException[] {
    const wrappedErrors = exceptions.map(e => (e instanceof OpraException ? e : new OpraException(e)));
    if (!wrappedErrors.length) wrappedErrors.push(new OpraException('Internal Server Error'));
    return wrappedErrors;
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
