import { ComplexType, DataType, DATATYPE_METADATA } from '@opra/common';
import { ExecutionContext, ServiceBase } from '@opra/core';
import mongodb, {
  ClientSession,
  type Document,
  MongoClient,
  ObjectId,
  type TransactionOptions,
} from 'mongodb';
import type { Nullish, StrictOmit, Type } from 'ts-gems';
import type { IsObject } from 'valgen';
import { MongoAdapter } from '../adapter/mongo-adapter.js';

const transactionKey = Symbol.for('transaction');

/**
 * The namespace for the MongoService.
 *
 * @namespace MongoService
 */
export namespace MongoService {
  export interface Options {
    db?: MongoService<any>['db'];
    session?: MongoService<any>['session'];
    collectionName?: MongoService<any>['collectionName'];
    resourceName?: MongoService<any>['resourceName'];
    documentFilter?: MongoService<any>['documentFilter'];
    interceptor?: MongoService<any>['interceptor'];
    idGenerator?: MongoService<any>['idGenerator'];
    scope?: MongoService<any>['scope'];
    onError?: MongoService<any>['onError'];
  }

  export type CrudOp = 'create' | 'read' | 'replace' | 'update' | 'delete';

  export interface CommandInfo {
    crud: CrudOp;
    method: string;
    byId: boolean;
    documentId?: MongoAdapter.AnyId;
    nestedId?: MongoAdapter.AnyId;
    input?: any;
    options?: any;
  }

  export type DocumentFilter =
    | MongoAdapter.FilterInput
    | ((
        args: CommandInfo,
        _this: MongoService<any>,
      ) =>
        | MongoAdapter.FilterInput
        | Promise<MongoAdapter.FilterInput>
        | undefined);

  /**
   * Represents options for "create" operation
   *
   * @interface
   */
  export interface CreateOptions extends mongodb.InsertOneOptions {
    projection?: string | string[] | Document | '*';
  }

  /**
   * Represents options for "count" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface CountOptions<T> extends mongodb.CountOptions {
    filter?: MongoAdapter.FilterInput<T>;
  }

  /**
   * Represents options for "delete" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DeleteOptions<T> extends mongodb.DeleteOptions {
    filter?: MongoAdapter.FilterInput<T>;
  }

  /**
   * Represents options for "deleteMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DeleteManyOptions<T> extends mongodb.DeleteOptions {
    filter?: MongoAdapter.FilterInput<T>;
  }

  /**
   * Represents options for "distinct" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DistinctOptions<T> extends mongodb.DistinctOptions {
    filter?: MongoAdapter.FilterInput<T>;
  }

  /**
   * Represents options for "exists" operation
   *
   * @interface
   */
  export interface ExistsOptions<T>
    extends Omit<mongodb.CommandOperationOptions, 'writeConcern'> {
    filter?: MongoAdapter.FilterInput<T>;
  }

  /**
   * Represents options for "findOne" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface FindOneOptions<T>
    extends StrictOmit<FindManyOptions<T>, 'limit'> {}

  /**
   * Represents options for "findMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface FindManyOptions<T> extends mongodb.AggregateOptions {
    filter?: MongoAdapter.FilterInput<T>;
    projection?: string | string[] | Document | '*';
    sort?: string[];
    limit?: number;
    skip?: number;
    preStages?: mongodb.Document[];
    postStages?: mongodb.Document[];
  }

  /**
   * Represents options for "replace" operation
   *
   * @interface
   */
  export interface ReplaceOptions<T>
    extends StrictOmit<mongodb.FindOneAndReplaceOptions, 'projection'> {
    projection?: string | string[] | Document | '*';
    filter?: MongoAdapter.FilterInput<T>;
  }

  /**
   * Represents options for "update" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface UpdateOneOptions<T>
    extends StrictOmit<
      mongodb.FindOneAndUpdateOptions,
      'projection' | 'returnDocument' | 'includeResultMetadata'
    > {
    projection?: string | string[] | Document | '*';
    filter?: MongoAdapter.FilterInput<T>;
  }

  /**
   * Represents options for "updateMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface UpdateManyOptions<T>
    extends StrictOmit<mongodb.UpdateOptions, 'upsert'> {
    filter?: MongoAdapter.FilterInput<T>;
  }
}

export interface MongoService {
  /**
   * Interceptor function for handling callback execution with provided arguments.
   * @type Function
   * @param next - The callback function to be intercepted.
   * @param {MongoService.CommandInfo} command - The arguments object containing the following properties:
   * @param _this - The reference to the current object.
   * @returns - The promise that resolves to the result of the callback execution.
   */
  interceptor?(
    next: () => any,
    command: MongoService.CommandInfo,
    _this: any,
  ): Promise<any>;
}

/**
 * Class representing a MongoDB service for interacting with a collection.
 * @extends ServiceBase
 * @template T - The type of the documents in the collection.
 */
export class MongoService<
  T extends mongodb.Document = mongodb.Document,
> extends ServiceBase {
  protected _dataTypeScope?: string;
  protected _dataType_: Type | string;
  protected _dataType?: ComplexType;
  protected _inputCodecs: Record<string, IsObject.Validator<T>> = {};
  protected _outputCodecs: Record<string, IsObject.Validator<T>> = {};

  /**
   * Defines comma delimited scopes for api document
   */
  scope?: string;

  /**
   * Represents the name of a collection in MongoDB
   */
  collectionName?: string | ((_this: any) => string);

  /**
   * Represents the name of a resource.
   * @type {string}
   */
  resourceName?: string | ((_this: any) => string);

  /**
   * Represents a MongoDB database object.
   */
  db?: mongodb.Db | ((_this: any) => mongodb.Db);

  /**
   * Represents a MongoDB ClientSession.
   */
  session?: mongodb.ClientSession | ((_this: any) => mongodb.ClientSession);

  /**
   * Generates a new id for new inserting Document.
   *
   */
  idGenerator?: (
    command: MongoService.CommandInfo,
    _this: any,
  ) => MongoAdapter.AnyId;

  /**
   * Callback function for handling errors.
   *
   * @param {unknown} error - The error object.
   * @param _this - The context object.
   */
  onError?: (error: unknown, _this: any) => void | Promise<void>;

  /**
   * Represents a common filter function for a MongoService.
   *
   * @type {FilterInput | Function}
   */
  documentFilter?: MongoService.DocumentFilter | MongoService.DocumentFilter[];

  /**
   * Constructs a new instance
   *
   * @param dataType - The data type of the returning results
   * @param [options] - The options for the service
   * @constructor
   */
  constructor(dataType: Type | string, options?: MongoService.Options) {
    super();
    this._dataType_ = dataType;
    this.db = options?.db;
    this.documentFilter = options?.documentFilter;
    this.interceptor = options?.interceptor;
    if (options?.collectionName) this.collectionName = options?.collectionName;
    else {
      if (typeof dataType === 'string') this.collectionName = dataType;
      if (typeof dataType === 'function') {
        const metadata = Reflect.getMetadata(DATATYPE_METADATA, dataType);
        if (metadata) this.collectionName = metadata.name;
      }
    }
    this.resourceName = options?.resourceName;
    this.idGenerator = options?.idGenerator;
    this.onError = options?.onError;
  }

  for<C extends ExecutionContext, P extends Partial<this>>(
    context: C | ServiceBase,
    overwriteProperties?: Nullish<P>,
    overwriteContext?: Partial<C>,
  ): this & Required<P> {
    if (overwriteProperties?.documentFilter && this.documentFilter) {
      overwriteProperties.documentFilter = [
        ...(Array.isArray(this.documentFilter)
          ? this.documentFilter
          : [this.documentFilter]),
        ...(Array.isArray(overwriteProperties?.documentFilter)
          ? overwriteProperties.documentFilter
          : [overwriteProperties.documentFilter]),
      ];
    }
    return super.for(context, overwriteProperties, overwriteContext);
  }

  /**
   * Retrieves the collection name.
   *
   * @protected
   * @returns The collection name.
   * @throws {Error} If the collection name is not defined.
   */
  getCollectionName(): string {
    const out =
      typeof this.collectionName === 'function'
        ? this.collectionName(this)
        : this.collectionName;
    if (out) return out;
    throw new Error('collectionName is not defined');
  }

  /**
   * Retrieves the resource name.
   *
   * @protected
   * @returns {string} The resource name.
   * @throws {Error} If the resource name is not defined.
   */
  getResourceName(): string {
    const out =
      typeof this.resourceName === 'function'
        ? this.resourceName(this)
        : this.resourceName || this.getCollectionName();
    if (out) return out;
    throw new Error('resourceName is not defined');
  }

  /**
   * Retrieves the OPRA data type
   *
   * @throws {NotAcceptableError} If the data type is not a ComplexType.
   */
  get dataType(): ComplexType {
    if (this._dataType && this._dataTypeScope !== this.scope)
      this._dataType = undefined;
    if (!this._dataType)
      this._dataType = this.context.documentNode.getComplexType(
        this._dataType_,
      );
    this._dataTypeScope = this.scope;
    return this._dataType;
  }

  /**
   * Executes the provided function within a transaction.
   *
   * @param callback - The function to be executed within the transaction.
   * @param [options] - Optional options for the transaction.
   */
  async withTransaction(
    callback: (session: ClientSession, _this: this) => any,
    options?: TransactionOptions,
  ): Promise<any> {
    const ctx = this.context;
    let closeSessionOnFinish = false;

    let transaction = ctx[transactionKey];
    let session: mongodb.ClientSession;

    if (transaction) {
      session = transaction.session;
    } else {
      const db = this.getDatabase();
      const client = (db as any).client as MongoClient;
      session = client.startSession();
      closeSessionOnFinish = true;
      transaction = {
        db,
        session,
      };
      ctx[transactionKey] = transaction;
    }

    const oldInTransaction = session.inTransaction();
    try {
      if (!oldInTransaction) session.startTransaction(options);
      const out = await callback(session, this);
      if (!oldInTransaction && session.inTransaction())
        await session.commitTransaction();
      return out;
    } catch (e) {
      if (!oldInTransaction && session.inTransaction())
        await session.abortTransaction();
      throw e;
    } finally {
      delete ctx[transactionKey];
      if (closeSessionOnFinish) {
        await session.endSession();
      }
    }
  }

  /**
   * Retrieves the database connection.
   *
   * @protected
   *
   * @throws {Error} If the context or database is not set.
   */
  protected getDatabase(): mongodb.Db {
    const ctx = this.context;
    const transaction = ctx[transactionKey];
    if (transaction) return transaction.db;
    const db = typeof this.db === 'function' ? this.db(this) : this.db;
    if (db) return db;
    throw new Error(`Database not set!`);
  }

  /**
   * Retrieves the database session.
   *
   * @protected
   *
   * @throws {Error} If the context or database is not set.
   */
  protected getSession(): mongodb.ClientSession | undefined {
    const ctx = this.context;
    const transaction = ctx[transactionKey];
    if (transaction) return transaction.session;
    const session =
      typeof this.session === 'function' ? this.session(this) : this.session;
    if (session) return session;
  }

  /**
   * Retrieves a MongoDB collection from the given database.
   *
   * @param db - The MongoDB database.
   * @protected
   */
  protected async getCollection(
    db: mongodb.Db,
  ): Promise<mongodb.Collection<T>> {
    return db.collection<T>(this.getCollectionName());
  }

  /**
   * Generates an ID.
   *
   * @protected
   * @returns {MongoAdapter.AnyId} The generated ID.
   */
  protected _generateId(command: MongoService.CommandInfo): MongoAdapter.AnyId {
    return typeof this.idGenerator === 'function'
      ? this.idGenerator(command, this)
      : new ObjectId();
  }

  /**
   * Retrieves the common filter used for querying documents.
   * This method is mostly used for security issues like securing multi-tenant applications.
   *
   * @protected
   * @returns {FilterInput | Promise<FilterInput> | undefined} The common filter or a Promise
   * that resolves to the common filter, or undefined if not available.
   */
  protected _getDocumentFilter(
    command: MongoService.CommandInfo,
  ): MongoAdapter.FilterInput | Promise<MongoAdapter.FilterInput> | undefined {
    const commonFilter = Array.isArray(this.documentFilter)
      ? this.documentFilter
      : [this.documentFilter];
    const mapped = commonFilter.map(f =>
      typeof f === 'function' ? f(command, this) : f,
    );
    return mapped.length > 1 ? MongoAdapter.prepareFilter(mapped) : mapped[0];
  }

  protected async _executeCommand(
    command: MongoService.CommandInfo,
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
        if (!(proto instanceof MongoService)) break;
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

  /**
   * Retrieves the codec for the specified operation.
   *
   * @param operation - The operation to retrieve the encoder for. Valid values are 'create' and 'update'.
   */
  protected _getInputCodec(operation: string): IsObject.Validator<T> {
    const dataType = this.dataType;
    const cacheKey =
      operation + (this._dataTypeScope ? ':' + this._dataTypeScope : '');
    let validator = this._inputCodecs[cacheKey];
    if (validator) return validator;
    const options: DataType.GenerateCodecOptions = {
      projection: '*',
      scope: this._dataTypeScope,
    };
    if (operation === 'update') {
      options.partial = 'deep';
      options.allowPatchOperators = true;
      options.keepKeyFields = true;
    }
    validator = dataType.generateCodec(
      'decode',
      options,
    ) as IsObject.Validator<T>;
    this._inputCodecs[cacheKey] = validator;
    return validator;
  }

  /**
   * Retrieves the codec.
   */
  protected _getOutputCodec(operation: string): IsObject.Validator<T> {
    const cacheKey =
      operation + (this._dataTypeScope ? ':' + this._dataTypeScope : '');
    let validator = this._outputCodecs[cacheKey];
    if (validator) return validator;
    const options: DataType.GenerateCodecOptions = {
      projection: '*',
      partial: 'deep',
      scope: this._dataTypeScope,
    };
    const dataType = this.dataType;
    validator = dataType.generateCodec(
      'decode',
      options,
    ) as IsObject.Validator<T>;
    this._outputCodecs[cacheKey] = validator;
    return validator;
  }
}
