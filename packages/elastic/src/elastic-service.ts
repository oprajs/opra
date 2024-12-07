import { Client } from '@elastic/elasticsearch';
import { ServiceBase } from '@opra/core';

/**
 * The namespace for the ElasticService.
 *
 * @namespace ElasticService
 */
export namespace ElasticService {
  export interface Options {
    client?: ElasticService['client'];
    interceptor?: ElasticService['interceptor'];
    onError?: ElasticService['onError'];
  }

  export type CrudOp = 'create' | 'read' | 'update' | 'delete';

  export interface CommandInfo {
    crud: CrudOp;
    method: string;
    byId: boolean;
    documentId?: any;
    input?: any;
    options?: any;
  }
}

export interface ElasticService {
  /**
   * Interceptor function for handling callback execution with provided arguments.
   * @type Function
   * @param next - The callback function to be intercepted.
   * @param {ElasticService.CommandInfo} command - The arguments object containing the following properties:
   * @param _this - The reference to the current object.
   * @returns - The promise that resolves to the result of the callback execution.
   */
  interceptor?(
    next: () => any,
    command: ElasticService.CommandInfo,
    _this: any,
  ): Promise<any>;
}

/**
 * Class representing a ElasticSearch service for interacting with a collection.
 * @extends ServiceBase
 * @template T - The type of the documents in the collection.
 */
export class ElasticService extends ServiceBase {
  /**
   * Represents a ElasticDB database object.
   */
  client?: Client | ((_this: any) => Client);

  /**
   * Callback function for handling errors.
   *
   * @param {unknown} error - The error object.
   * @param _this - The context object.
   */
  onError?: (error: unknown, _this: any) => void | Promise<void>;

  /**
   * Constructs a new instance
   *
   * @param [options] - The options for the service
   * @constructor
   */
  constructor(options?: ElasticService.Options) {
    super();
    this.interceptor = options?.interceptor;
    this.client = options?.client;
    this.onError = options?.onError;
  }

  /**
   * Retrieves the ElasticSearch client.
   *
   * @protected
   *
   * @throws {Error} If the context or client is not set.
   */
  getClient(): Client {
    // @ts-ignore
    const db =
      typeof this.client === 'function'
        ? (this.client as Function)(this)
        : this.client;
    if (!db) throw new Error(`Client not set!`);
    return db;
  }

  protected async _executeCommand(
    command: ElasticService.CommandInfo,
    commandFn: () => any,
  ): Promise<any> {
    let proto: any;
    const next = async () => {
      proto = proto ? Object.getPrototypeOf(proto) : this;
      while (proto) {
        if (
          proto.interceptor &&
          Object.prototype.hasOwnProperty.call(proto, 'interceptor')
        ) {
          return await proto.interceptor.call(this, next, command, this);
        }
        proto = Object.getPrototypeOf(proto);
        if (!(proto instanceof ElasticService)) break;
      }
      return commandFn();
    };
    try {
      return await next();
    } catch (e: any) {
      Error.captureStackTrace(e, this._executeCommand);
      await this.onError?.(e, this);
      throw e;
    }
  }
}
