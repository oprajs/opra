import { merge } from '@jsopen/objects';
import {
  ApiDocument,
  MQ_CONTROLLER_METADATA,
  MQController,
  MQOperation,
} from '@opra/common';
import * as rabbit from 'rabbitmq-client';
import {
  RMQ_OPERATION_METADATA,
  RMQ_OPERATION_METADATA_RESOLVER,
} from './constants.js';
import type { RabbitmqAdapter } from './rabbitmq-adapter.js';

/**
 * Helper class for building RabbitMQ adapter configuration and operation handlers.
 */
export class ConfigBuilder {
  declare connectionOptions: RabbitmqAdapter.ConnectionOptions;
  declare controllerInstances: Map<MQController, any>;
  declare handlerArgs: ConfigBuilder.OperationArguments[];

  /**
   * Initializes a new instance of the ConfigBuilder.
   *
   * @param document - The API document.
   * @param config - The adapter configuration.
   */
  constructor(
    readonly document: ApiDocument,
    readonly config: RabbitmqAdapter.Config,
  ) {}

  /**
   * Builds the configuration, identifying controller instances and operation handlers.
   *
   * @returns A promise that resolves when the build is complete.
   */
  async build() {
    this.controllerInstances = new Map();
    this.handlerArgs = [];
    this._prepareConnectionOptions();

    /* Initialize consumers */
    for (const controller of this.document.getMqApi().controllers.values()) {
      let instance = controller.instance;
      if (!instance && controller.ctor) instance = new controller.ctor();
      if (!instance) continue;
      this.controllerInstances.set(controller, instance);

      /* Build HandlerData array */
      for (const operation of controller.operations.values()) {
        const consumerConfig = await this._getConsumerConfig(
          controller,
          instance,
          operation,
        );
        if (!consumerConfig) continue;
        const args: ConfigBuilder.OperationArguments = {
          // consumer: null as any,
          controller,
          instance,
          operation,
          consumerConfig,
          // handler: null as any,
          topics: (Array.isArray(operation.channel)
            ? operation.channel
            : [operation.channel]
          ).map(String),
        };
        this.handlerArgs.push(args);
      }
    }
  }

  /**
   * Prepares the RabbitMQ connection options from the provided configuration.
   *
   * @protected
   */
  protected _prepareConnectionOptions() {
    this.connectionOptions = {};
    if (Array.isArray(this.config.connection))
      this.connectionOptions.urls = this.config.connection;
    else if (typeof this.config.connection === 'object') {
      merge(this.connectionOptions, this.config.connection, { deep: true });
    } else
      this.connectionOptions.urls = [
        this.config.connection || 'amqp://guest:guest@localhost:5672',
      ];
  }

  /**
   * Resolves the consumer configuration for a specific operation.
   *
   * @param controller - The MQ controller definition.
   * @param instance - The controller instance.
   * @param operation - The MQ operation definition.
   * @returns A promise that resolves to the consumer configuration or undefined.
   * @protected
   */
  protected async _getConsumerConfig(
    controller: MQController,
    instance: any,
    operation: MQOperation,
  ): Promise<RabbitmqAdapter.ConsumerConfig | undefined> {
    if (typeof instance[operation.name] !== 'function') return;
    const proto = controller.ctor?.prototype || Object.getPrototypeOf(instance);
    if (Reflect.hasMetadata(MQ_CONTROLLER_METADATA, proto, operation.name))
      return;
    const operationConfig: rabbit.ConsumerProps = {};
    if (this.config.defaults) {
      if (this.config.defaults.consumer) {
        merge(operationConfig, this.config.defaults.consumer, { deep: true });
      }
    }

    let metadata = Reflect.getMetadata(
      RMQ_OPERATION_METADATA,
      proto,
      operation.name,
    ) as RabbitmqAdapter.ConsumerConfig;
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
    if (metadata && typeof metadata === 'object') {
      merge(operationConfig, metadata, { deep: true });
    }

    return operationConfig;
  }
}

export namespace ConfigBuilder {
  export interface OperationArguments {
    controller: MQController;
    instance: any;
    operation: MQOperation;
    consumerConfig: RabbitmqAdapter.ConsumerConfig;
    topics: string[];
  }
}
