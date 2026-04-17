import {
  ApiDocument,
  MQ_CONTROLLER_METADATA,
  MQApi,
  MQController,
  MQOperation,
  OpraException,
  OpraSchema,
} from '@opra/common';
import { type ILogger, kAssetCache, PlatformAdapter } from '@opra/core';
import {
  type Consumer,
  type ConsumerConfig,
  type EachMessageHandler,
  EachMessagePayload,
  Kafka,
  type KafkaConfig,
  logLevel,
} from 'kafkajs';
import type { StrictOmit } from 'ts-gems';
import { Validator, vg } from 'valgen';
import {
  KAFKA_DEFAULT_GROUP,
  KAFKA_OPERATION_METADATA,
  KAFKA_OPERATION_METADATA_RESOLVER,
} from './constants.js';
import { KafkaContext } from './kafka-context.js';
import { RequestParser } from './request-parser.js';

const globalErrorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
const kGroupId = Symbol('kGroupId');
const noOp = () => undefined;

export interface OperationConfig {
  consumer: ConsumerConfig;
  selfConsumer?: boolean;
  subscribe?: KafkaAdapter.OperationOptions['subscribe'];
}

interface HandlerArguments {
  consumer: Consumer;
  controller: MQController;
  instance: any;
  operation: MQOperation;
  operationConfig: OperationConfig;
  handler: EachMessageHandler;
  topics: (string | RegExp)[];
}

/**
 * Adapter for integrating Kafka into the Opra platform.
 * It manages Kafka consumers, handles message routing to controllers,
 * and provides integration with the Opra execution context.
 */
export class KafkaAdapter extends PlatformAdapter<KafkaAdapter.Events> {
  static readonly PlatformName = 'kafka';
  protected _config: KafkaAdapter.Config;
  protected _controllerInstances = new Map<MQController, any>();
  protected _consumers = new Map<string, Consumer>();
  protected _handlerArgs: HandlerArguments[] = [];
  declare protected _kafka: Kafka;
  protected _status: KafkaAdapter.Status = 'idle';
  readonly transform: OpraSchema.Transport = 'mq';
  readonly platform = KafkaAdapter.PlatformName;
  readonly interceptors: (
    | KafkaAdapter.InterceptorFunction
    | KafkaAdapter.IKafkaInterceptor
  )[];

  /**
   * Initializes a new instance of the KafkaAdapter.
   *
   * @param document - The API document that defines the Kafka services and controllers.
   * @param config - The configuration options for the Kafka adapter.
   * @throws {@link TypeError} Throws if the document does not expose a Kafka API.
   */
  constructor(document: ApiDocument, config: KafkaAdapter.Config) {
    super(config);
    this._document = document;
    this._config = config;
    if (
      !(
        this.document.api instanceof MQApi &&
        this.document.api.platform === KafkaAdapter.PlatformName
      )
    ) {
      throw new TypeError(`The document doesn't expose a Kafka Api`);
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

  /**
   * Gets the MQ API defined in the document.
   */
  get api(): MQApi {
    return this.document.getMqApi();
  }

  /**
   * Gets the Kafka client instance.
   */
  get kafka(): Kafka {
    return this._kafka;
  }

  /**
   * Gets the configuration scope for the adapter.
   */
  get scope(): string | undefined {
    return this._config.scope;
  }

  /**
   * Gets the current status of the adapter.
   */
  get status(): KafkaAdapter.Status {
    return this._status;
  }

  /**
   * Initializes the Kafka client and all defined consumers.
   * This method is called automatically by {@link start} if not already initialized.
   */
  async initialize() {
    if (this._kafka) return;
    this._kafka = new Kafka({
      ...this._config.client,
      logCreator: this.logger
        ? () => this._createLogCreator(this.logger!, this._config.logExtra)
        : undefined,
    });
    await this._createAllConsumers();
  }

  /**
   * Starts the Kafka adapter, connecting all consumers and subscribing to topics.
   *
   * @throws {@link Error} Throws if a consumer fails to connect or subscribe.
   */
  async start() {
    if (this.status !== 'idle') return;
    await this.initialize();
    this._status = 'starting';

    try {
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
        args.topics = Array.isArray(operation.channel)
          ? operation.channel
          : [operation.channel];
        await consumer
          .subscribe({
            ...operationConfig.subscribe,
            topics: args.topics,
          })
          .catch(e => {
            this._emitError(e);
            throw e;
          });
        this.logger?.info?.(
          `Subscribed to topic${args.topics.length > 1 ? 's' : ''} "${args.topics}"`,
        );
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
                    args.topics.find(t =>
                      t instanceof RegExp ? t.test(topic) : t === topic,
                    ),
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
            },
          })
          .catch(e => {
            this._emitError(e);
            throw e;
          });
      }
      this._status = 'started';
    } catch (e) {
      await this.close();
      throw e;
    }
  }

  /**
   * Closes all active Kafka consumers and clears internal caches.
   * This effectively stops the service and returns it to the idle state.
   */
  async close() {
    await Promise.allSettled(
      Array.from(this._consumers.values()).map(c => c.disconnect()),
    );
    this._consumers.clear();
    this._controllerInstances.clear();
    this._status = 'idle';
  }

  /**
   * Retrieves a controller instance by its path.
   *
   * @param controllerPath - The unique path of the controller.
   * @returns The controller instance or undefined if not found.
   */
  getControllerInstance<T>(controllerPath: string): T | undefined {
    const controller = this.api.findController(controllerPath);
    return controller && this._controllerInstances.get(controller);
  }

  /**
   * Resolves the configuration for a specific MQ operation.
   *
   * @param controller - The MQ controller containing the operation.
   * @param instance - The actual instance of the controller class.
   * @param operation - The MQ operation being configured.
   * @returns A promise that resolves to the operation configuration or undefined if not applicable.
   * @protected
   */
  protected async _getOperationConfig(
    controller: MQController,
    instance: any,
    operation: MQOperation,
  ): Promise<OperationConfig | undefined> {
    if (typeof instance[operation.name] !== 'function') return;
    const proto = controller.ctor?.prototype || Object.getPrototypeOf(instance);
    if (Reflect.hasMetadata(MQ_CONTROLLER_METADATA, proto, operation.name))
      return;
    const operationConfig: OperationConfig = {
      consumer: {
        groupId: KAFKA_DEFAULT_GROUP,
      },
      subscribe: {},
    };
    if (this._config.defaults) {
      if (this._config.defaults.subscribe) {
        Object.assign(
          operationConfig.subscribe!,
          this._config.defaults.subscribe,
        );
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
      const configResolver = Reflect.getMetadata(
        KAFKA_OPERATION_METADATA_RESOLVER,
        proto,
        operation.name,
      );
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
   * Creates and prepares all consumers defined in the API document.
   * @protected
   */
  protected async _createAllConsumers() {
    for (const controller of this.document.getMqApi().controllers.values()) {
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
   * Creates a Rabbitmq consumer for the given handler arguments if it doesn't already exist.
   *
   * @param args - The handler arguments containing configuration and state.
   * @throws {@link Error} Throws if a self-consumer for the group ID already exists.
   * @protected
   */
  protected async _createConsumer(args: HandlerArguments) {
    const { operationConfig } = args;
    let consumer = this._consumers.get(operationConfig.consumer.groupId);
    if (consumer && operationConfig.selfConsumer) {
      throw new Error(
        `Operation consumer for groupId (${operationConfig.consumer.groupId}) already exists`,
      );
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
   * Creates a message handler for a specific MQ operation.
   * This handler processes incoming Kafka messages, decodes them, and executes the operation.
   *
   * @param args - The handler arguments for the operation.
   * @protected
   */
  protected _createHandler(args: HandlerArguments) {
    const { controller, instance, operation } = args;
    /** Prepare parsers */
    const parseKey = RequestParser.STRING;
    const parsePayload = RequestParser.STRING;
    /** Prepare decoders */
    const decodeKey = operation.generateKeyCodec('decode', {
      scope: this.scope,
      ignoreReadonlyFields: true,
    });
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
            const decode =
              this[kAssetCache].get<Validator>(header, 'decode') || vg.isAny();
            headers[k] = decode(Buffer.isBuffer(v) ? v.toString() : v);
          }
        }
      } catch (e) {
        this._emitError(e);
        return;
      }
      /** Create context */
      const context = new KafkaContext({
        __adapter: this,
        __contDef: controller,
        __controller: instance,
        __oprDef: operation,
        __handler: operationHandler,
        topic,
        partition,
        payload,
        key,
        headers,
        rawMessage: message,
        heartbeat,
        pause,
      });

      await this.emitAsync('execute', context);
      try {
        /** Call operation handler */
        const result = await operationHandler.call(instance, context);
        await this.emitAsync('finish', context, result);
      } catch (e: any) {
        this._emitError(e, context);
      }
    };
  }

  /**
   * Emits an error event and logs the error.
   *
   * @param error - The error that occurred.
   * @param context - The optional Kafka execution context.
   * @protected
   */
  protected _emitError(error: any, context?: KafkaContext) {
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
        if (this.listenerCount('error')) this._emitError(error);
      })
      .catch(noOp);
  }

  /**
   * Wraps multiple exceptions into an array of {@link OpraException}.
   *
   * @param exceptions - The array of exceptions to wrap.
   * @returns An array of wrapped exceptions.
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

  /**
   * Creates a KafkaJS log creator that redirects logs to the provided logger.
   *
   * @param logger - The logger instance to use.
   * @param logExtra - Whether to include additional metadata in the logs.
   * @returns A log creator function for KafkaJS.
   * @protected
   */
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

/**
 * Namespace for KafkaAdapter related types and interfaces.
 */
export namespace KafkaAdapter {
  /**
   * Callback function for the next middleware in the interceptor chain.
   */
  export type NextCallback = () => Promise<any>;

  /**
   * Represents the operational status of the Kafka adapter.
   */
  export type Status = 'idle' | 'starting' | 'started';

  /**
   * Configuration options for the Kafka adapter.
   */
  export interface Config extends PlatformAdapter.Options {
    /** Kafka client configuration */
    client: StrictOmit<KafkaConfig, 'logCreator' | 'logLevel'>;
    /** Map of consumer group IDs to their configurations */
    consumers?: Record<string, StrictOmit<ConsumerConfig, 'groupId'>>;
    /** Default configurations for consumers and subscriptions */
    defaults?: {
      consumer?: ConsumerConfig;
      subscribe?: {
        fromBeginning?: boolean;
      };
    };
    /** Scope for decoding and encoding */
    scope?: string;
    /** Interceptors to wrap the execution of operations */
    interceptors?: (InterceptorFunction | IKafkaInterceptor)[];
    /** Whether to log additional information from KafkaJS */
    logExtra?: boolean;
  }

  /**
   * Options for a specific Kafka operation.
   */
  export interface OperationOptions {
    /**
     * Group ID or consumer configuration.
     */
    consumer?: string | ConsumerConfig;
    /**
     * Subscription options for the topic.
     */
    subscribe?: {
      fromBeginning?: boolean;
    };
  }

  /**
   * Type definition for a Kafka interceptor function.
   */
  export type InterceptorFunction = IKafkaInterceptor['intercept'];

  /**
   * Interface for a Kafka interceptor class.
   */
  export interface IKafkaInterceptor {
    /**
     * Intercepts the execution of a Kafka operation.
     *
     * @param context - The Kafka execution context.
     * @param next - The next function in the chain.
     * @returns A promise that resolves to the result of the operation.
     */
    intercept(context: KafkaContext, next: NextCallback): Promise<any>;
  }

  /**
   * Event definitions for the Kafka adapter.
   */
  export interface Events {
    /** Emitted when an error occurs */
    error: [error: Error, context: KafkaContext | undefined];
    /** Emitted when an operation finishes successfully */
    finish: [context: KafkaContext, result: any];
    /** Emitted when an operation starts execution */
    execute: [context: KafkaContext];
    /** Emitted when a message is received from Kafka */
    message: [content: EachMessagePayload];
  }
}
