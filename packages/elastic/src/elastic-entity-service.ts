import type * as elastic from '@elastic/elasticsearch/lib/api/types.js';
import type { TransportRequestOptions } from '@elastic/transport';
import {
  ComplexType,
  DataType,
  DATATYPE_METADATA,
  InternalServerError,
} from '@opra/common';
import type {
  PartialDTO,
  PatchDTO,
  RequiredSome,
  StrictOmit,
  Type,
} from 'ts-gems';
import { isNotNullish, type IsObject } from 'valgen';
import { ElasticAdapter } from './elastic-adapter.js';
import { ElasticService } from './elastic-service.js';

/**
 *
 * @namespace ElasticEntityService
 */
export namespace ElasticEntityService {
  /**
   * The constructor options of ElasticEntityService.
   *
   * @interface Options
   * @extends ElasticService.Options
   */
  export interface Options extends ElasticService.Options {
    indexName?: ElasticEntityService['indexName'];
    resourceName?: ElasticEntityService['resourceName'];
    idGenerator?: ElasticEntityService['idGenerator'];
    scope?: ElasticEntityService['scope'];
  }

  export interface CommandInfo extends ElasticService.CommandInfo {}

  /**
   * Represents options for "create" operation
   *
   * @interface
   */
  export interface CreateOptions {
    request?: elastic.CreateRequest;
    transport?: TransportRequestOptions;
  }

  /**
   * Represents options for "count" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface CountOptions {
    filter?: ElasticAdapter.FilterInput;
    request?: elastic.CountRequest;
    transport?: TransportRequestOptions;
  }

  /**
   * Represents options for "delete" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DeleteOptions {
    filter?: ElasticAdapter.FilterInput;
    request?: elastic.DeleteByQueryRequest;
    transport?: TransportRequestOptions;
  }

  /**
   * Represents options for "deleteMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface DeleteManyOptions {
    filter?: ElasticAdapter.FilterInput;
    request?: elastic.DeleteByQueryRequest;
    transport?: TransportRequestOptions;
  }

  /**
   * Represents options for "findOne" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface FindOneOptions
    extends StrictOmit<FindManyOptions, 'limit'> {}

  /**
   * Represents options for "findMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface FindManyOptions {
    filter?: ElasticAdapter.FilterInput;
    projection?: string | string[];
    sort?: string[];
    limit?: number;
    skip?: number;
    request?: elastic.SearchRequest;
    transport?: TransportRequestOptions;
  }

  /**
   * Represents options for "update" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface UpdateOneOptions {
    filter?: ElasticAdapter.FilterInput;
    request?: elastic.UpdateByQueryRequest;
    transport?: TransportRequestOptions;
  }

  /**
   * Represents options for "updateMany" operation
   *
   * @interface
   * @template T - The type of the document.
   */
  export interface UpdateManyOptions {
    filter?: ElasticAdapter.FilterInput;
    request?: elastic.UpdateByQueryRequest;
    transport?: TransportRequestOptions;
  }

  export interface CreateCommand
    extends StrictOmit<RequiredSome<CommandInfo, 'input'>, 'documentId'> {
    crud: 'create';
    options?: CreateOptions;
  }

  export interface CountCommand
    extends StrictOmit<CommandInfo, 'documentId' | 'input'> {
    crud: 'read';
    options?: CountOptions;
  }

  export interface DeleteCommand extends StrictOmit<CommandInfo, 'input'> {
    crud: 'delete';
    options?: DeleteOptions;
  }

  export interface DeleteManyCommand extends StrictOmit<CommandInfo, 'input'> {
    crud: 'delete';
    options?: DeleteManyOptions;
  }

  export interface FindManyCommand extends StrictOmit<CommandInfo, 'input'> {
    crud: 'read';
    options?: FindManyOptions;
  }

  export interface UpdateCommand<T> extends CommandInfo {
    crud: 'update';
    input: PatchDTO<T>;
    options?: UpdateOneOptions;
  }
}

/**
 * @class ElasticEntityService
 * @template T - The type of the documents in the collection.
 */
export class ElasticEntityService<
  T extends object = any,
> extends ElasticService {
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
   * Represents the name of a index in ElasticDB
   */
  indexName?: string | ((_this: any) => string);

  /**
   * Represents the name of a resource.
   * @type {string}
   */
  resourceName?: string | ((_this: any) => string);

  /**
   * Generates a new id for new inserting Document.
   *
   */
  idGenerator?: (command: ElasticEntityService.CommandInfo, _this: any) => any;

  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {ElasticEntityService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type | string, options?: ElasticEntityService.Options) {
    super(options);
    this._dataType_ = dataType;
    if (options?.indexName) this.indexName = options?.indexName;
    else {
      if (typeof dataType === 'string') this.indexName = dataType;
      if (typeof dataType === 'function') {
        const metadata = Reflect.getMetadata(DATATYPE_METADATA, dataType);
        if (metadata) this.indexName = metadata.name;
      }
    }
    this.resourceName = options?.resourceName;
    this.idGenerator = options?.idGenerator;
  }

  /**
   * Retrieves the index name.
   *
   * @protected
   * @returns The index name.
   * @throws {Error} If the index name is not defined.
   */
  getIndexName(): string {
    const out =
      typeof this.indexName === 'function'
        ? this.indexName(this)
        : this.indexName;
    if (out) return out;
    throw new Error('indexName is not defined');
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
        : this.resourceName || this.getIndexName();
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
   * Adds a JSON document to the specified data stream or index and makes it searchable.
   * If the target is an index and the document already exists,
   * the request updates the document and increments its version.
   *
   * @param {ElasticEntityService.CreateCommand} command
   * @protected
   */
  protected async _create(
    command: ElasticEntityService.CreateCommand,
  ): Promise<elastic.CreateResponse> {
    const input = command.input;
    isNotNullish(input, { label: 'input' });
    isNotNullish(input._id, { label: 'input._id' });
    const inputCodec = this._getInputCodec('create');
    const doc: any = inputCodec(input);
    delete doc._id;
    const { options } = command;
    const request: elastic.CreateRequest = {
      ...options?.request,
      index: this.getIndexName(),
      id: input._id,
      document: doc,
    };
    const client = this.getClient();
    const r = await client.create(request, options?.transport);
    /* istanbul ignore next */
    if (!(r._id && (r.result === 'created' || r.result === 'updated'))) {
      throw new InternalServerError(
        `Unknown error while creating document for "${this.getResourceName()}"`,
      );
    }
    return r;
  }

  /**
   * Returns the count of documents in the collection based on the provided options.
   *
   * @param {ElasticEntityService.CountCommand} command
   * @protected
   */
  protected async _count(
    command: ElasticEntityService.CountCommand,
  ): Promise<elastic.CountResponse> {
    const { options } = command;
    const filterQuery = ElasticAdapter.prepareFilter([
      options?.filter,
      options?.request?.query,
    ]);
    let query: elastic.QueryDslQueryContainer | undefined = {
      ...options?.request?.query,
      ...filterQuery,
    };
    if (!Object.keys(query).length) query = undefined;
    const request: elastic.CountRequest = {
      index: this.getIndexName(),
      ...options?.request,
      query,
    };
    const client = this.getClient();
    return client.count(request, options?.transport);
  }

  /**
   * Deletes a document from the collection.
   *
   * @param {ElasticEntityService.DeleteCommand} command
   * @protected
   */
  protected async _delete(
    command: ElasticEntityService.DeleteCommand,
  ): Promise<elastic.DeleteByQueryResponse> {
    isNotNullish(command.documentId, { label: 'documentId' });
    const { options } = command;
    const filterQuery = ElasticAdapter.prepareFilter([
      { ids: { values: [command.documentId] } },
      options?.filter,
      options?.request?.query,
    ]);
    let query: elastic.QueryDslQueryContainer | undefined = {
      ...options?.request?.query,
      ...filterQuery,
    };
    if (!Object.keys(query).length) query = { match_all: {} };
    const request: elastic.DeleteByQueryRequest = {
      index: this.getIndexName(),
      ...options?.request,
      query,
    };
    const client = this.getClient();
    return client.deleteByQuery(request, options?.transport);
  }

  /**
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param {ElasticEntityService.DeleteManyCommand} command
   * @protected
   */
  protected async _deleteMany(
    command: ElasticEntityService.DeleteManyCommand,
  ): Promise<elastic.DeleteByQueryResponse> {
    const { options } = command;
    const filterQuery = ElasticAdapter.prepareFilter([
      options?.filter,
      options?.request?.query,
    ]);
    let query: elastic.QueryDslQueryContainer | undefined = {
      ...options?.request?.query,
      ...filterQuery,
    };
    if (!Object.keys(query).length) query = { match_all: {} };
    const request: elastic.DeleteByQueryRequest = {
      ...options?.request,
      index: this.getIndexName(),
      query,
    };
    const client = this.getClient();
    return client.deleteByQuery(request, options?.transport);
  }

  /**
   * Returns search hits that match the query defined in the request
   *
   * @param {ElasticEntityService.FindManyCommand} command
   */
  protected async _findMany(
    command: ElasticEntityService.FindManyCommand,
  ): Promise<elastic.SearchResponse> {
    const { options } = command;
    const filterQuery = ElasticAdapter.prepareFilter([
      command.documentId
        ? { ids: { values: [command.documentId] } }
        : undefined,
      options?.filter,
      options?.request?.query,
    ]);
    let query: elastic.QueryDslQueryContainer | undefined = {
      ...options?.request?.query,
      ...filterQuery,
    };
    if (!Object.keys(query).length) query = { match_all: {} };
    const request: elastic.SearchRequest = {
      from: options?.skip,
      size: options?.limit,
      sort: options?.sort
        ? ElasticAdapter.prepareSort(options?.sort)
        : undefined,
      _source: ElasticAdapter.prepareProjection(
        this.dataType,
        options?.projection,
        this._dataTypeScope,
      ),
      index: this.getIndexName(),
      ...options?.request,
      query,
    };
    const client = this.getClient();
    return client.search(request, options?.transport);
  }

  /**
   * Updates multiple documents in the collection based on the specified input and options.
   *
   * @param {ElasticEntityService.UpdateCommand<T>} command
   */
  protected async _updateMany(
    command: ElasticEntityService.UpdateCommand<T>,
  ): Promise<elastic.UpdateByQueryResponse> {
    if (command.byId) isNotNullish(command.documentId, { label: 'documentId' });
    const { options } = command;
    const input: any = command.input;
    const requestScript = command.options?.request?.script;
    let script: elastic.Script | undefined;
    const inputKeysLen = Object.keys(input).length;
    isNotNullish(inputKeysLen || script, { label: 'input' });
    if (requestScript) {
      script =
        typeof requestScript === 'string'
          ? { source: requestScript }
          : { ...requestScript };
      script.lang = script.lang || 'painless';
      if (inputKeysLen > 0 && script.lang !== 'painless') {
        throw new TypeError(
          `You cannot provide 'input' and 'script' arguments at the same time unless the script lang is 'painless'`,
        );
      }
    }
    if (inputKeysLen) {
      delete input._id;
      const inputCodec = this._getInputCodec('update');
      const doc = inputCodec(input);
      const scr = ElasticAdapter.preparePatch(doc);
      if (script) {
        script.source =
          (script.source ? script.source + '\n' + script.source : '') +
          scr.source;
        script.params = { ...script.params, ...scr.params };
      } else script = scr;
    }
    script!.source = script?.source || 'return;';
    const filterQuery = ElasticAdapter.prepareFilter([
      command.byId ? { ids: { values: [command.documentId] } } : undefined,
      options?.filter,
      options?.request?.query,
    ]);
    let query: elastic.QueryDslQueryContainer | undefined = {
      ...options?.request?.query,
      ...filterQuery,
    };
    if (!Object.keys(query).length) query = { match_all: {} };
    const request: elastic.UpdateByQueryRequest = {
      ...options?.request,
      index: this.getIndexName(),
      script,
      query,
    };
    const client = this.getClient();
    return client.updateByQuery(request, options?.transport);
  }

  /**
   * Generates an ID.
   *
   * @protected
   * @returns The generated ID.
   */
  protected _generateId(command: ElasticEntityService.CommandInfo): any {
    return typeof this.idGenerator === 'function'
      ? this.idGenerator(command, this)
      : undefined;
  }

  /**
   * Retrieves the codec for the specified operation.
   *
   * @param operation - The operation to retrieve the encoder for. Valid values are 'create' and 'update'.
   */
  protected _getInputCodec(operation: string): IsObject.Validator<T> {
    const cacheKey =
      operation + (this._dataTypeScope ? ':' + this._dataTypeScope : '');
    let validator = this._inputCodecs[cacheKey];
    if (validator) return validator;
    const options: DataType.GenerateCodecOptions = {
      projection: '*',
      scope: this._dataTypeScope,
    };
    if (operation === 'update') options.partial = 'deep';
    const dataType = this.dataType;
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

  protected async _executeCommand(
    command: ElasticEntityService.CommandInfo,
    commandFn: () => any,
  ): Promise<any> {
    try {
      const result = await super._executeCommand(command, async () => {
        /** Call before[X] hooks */
        if (command.crud === 'create')
          await this._beforeCreate(
            command as ElasticEntityService.CreateCommand,
          );
        else if (command.crud === 'update' && command.byId) {
          await this._beforeUpdate(
            command as ElasticEntityService.UpdateCommand<T>,
          );
        } else if (command.crud === 'update' && !command.byId) {
          await this._beforeUpdateMany(
            command as ElasticEntityService.UpdateCommand<T>,
          );
        } else if (command.crud === 'delete' && command.byId) {
          await this._beforeDelete(
            command as ElasticEntityService.DeleteCommand,
          );
        } else if (command.crud === 'delete' && !command.byId) {
          await this._beforeDeleteMany(
            command as ElasticEntityService.DeleteCommand,
          );
        }
        /** Call command function */
        return commandFn();
      });
      /** Call after[X] hooks */
      if (command.crud === 'create')
        await this._afterCreate(
          command as ElasticEntityService.CreateCommand,
          result,
        );
      else if (command.crud === 'update' && command.byId) {
        await this._afterUpdate(
          command as ElasticEntityService.UpdateCommand<T>,
          result,
        );
      } else if (command.crud === 'update' && !command.byId) {
        await this._afterUpdateMany(
          command as ElasticEntityService.UpdateCommand<T>,
          result,
        );
      } else if (command.crud === 'delete' && command.byId) {
        await this._afterDelete(
          command as ElasticEntityService.DeleteCommand,
          result,
        );
      } else if (command.crud === 'delete' && !command.byId) {
        await this._afterDeleteMany(
          command as ElasticEntityService.DeleteCommand,
          result,
        );
      }
      return result;
    } catch (e: any) {
      Error.captureStackTrace(e, this._executeCommand);
      await this.onError?.(e, this);
      throw e;
    }
  }

  protected async _beforeCreate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: ElasticEntityService.CreateCommand,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeUpdate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: ElasticEntityService.UpdateCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeUpdateMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: ElasticEntityService.UpdateCommand<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeDelete(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: ElasticEntityService.DeleteCommand,
  ): Promise<void> {
    // Do nothing
  }

  protected async _beforeDeleteMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: ElasticEntityService.DeleteCommand,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterCreate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: ElasticEntityService.CreateCommand,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result: PartialDTO<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterUpdate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: ElasticEntityService.UpdateCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result?: PartialDTO<T>,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterUpdateMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: ElasticEntityService.UpdateCommand<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    affected: number,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterDelete(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: ElasticEntityService.DeleteCommand,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    affected: number,
  ): Promise<void> {
    // Do nothing
  }

  protected async _afterDeleteMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command: ElasticEntityService.DeleteCommand,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    affected: number,
  ): Promise<void> {
    // Do nothing
  }
}
