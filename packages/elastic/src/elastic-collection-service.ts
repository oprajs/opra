/* eslint-disable camelcase */
import type * as elastic from '@elastic/elasticsearch/lib/api/types';
import { ResourceNotAvailableError } from '@opra/common';
import { HttpContext } from '@opra/core';
import type { DTO, Nullish, PartialDTO, PatchDTO, RequiredSome, Type } from 'ts-gems';
import { ElasticAdapter } from './elastic-adapter.js';
import { ElasticEntityService } from './elastic-entity-service.js';
import { ElasticService } from './elastic-service.js';

/**
 *
 * @namespace ElasticCollectionService
 */
export namespace ElasticCollectionService {
  /**
   * The constructor options of ElasticCollectionService.
   *
   * @interface Options
   * @extends ElasticService.Options
   */
  export interface Options extends ElasticEntityService.Options {
    documentFilter?: ElasticCollectionService['documentFilter'];
    defaultLimit?: number;
  }

  export type DocumentFilter =
    | ElasticAdapter.FilterInput
    | ((
        args: ElasticEntityService.CommandInfo,
        _this: ElasticCollectionService,
      ) => ElasticAdapter.FilterInput | Promise<ElasticAdapter.FilterInput> | undefined);

  export interface FindManyWithCountResult<X> {
    items: X[];
    count: number;
    relation: elastic.SearchTotalHitsRelation;
  }
}

/**
 * @class ElasticCollectionService
 * @template T - The type of the documents in the collection.
 */
export class ElasticCollectionService<T extends object = any> extends ElasticEntityService<T> {
  /**
   * Represents a common filter function for a ElasticService.
   *
   * @type {FilterInput | Function}
   */
  documentFilter?: ElasticCollectionService.DocumentFilter | ElasticCollectionService.DocumentFilter[];

  /**
   * Represents the default limit value for a certain operation.
   *
   * @type {number}
   */
  defaultLimit: number;

  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {ElasticCollectionService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type | string, options?: ElasticCollectionService.Options) {
    super(dataType, options);
    this.documentFilter = options?.documentFilter;
    this.defaultLimit = options?.defaultLimit || 10;
  }

  for<C extends HttpContext, P extends Partial<this>>(
    context: C,
    overwriteProperties?: Nullish<P>,
    overwriteContext?: Partial<C>,
  ): this & Required<P> {
    if (overwriteProperties?.documentFilter && this.documentFilter) {
      overwriteProperties.documentFilter = [
        ...(Array.isArray(this.documentFilter) ? this.documentFilter : [this.documentFilter]),
        ...(Array.isArray(overwriteProperties?.documentFilter)
          ? overwriteProperties?.documentFilter
          : [overwriteProperties?.documentFilter]),
      ];
    }
    return super.for(context, overwriteProperties, overwriteContext);
  }

  /**
   * Asserts the existence of a resource with the given ID.
   * Throws a ResourceNotFoundError if the resource does not exist.
   *
   * @param {string} id - The ID of the resource to assert.
   * @param {ElasticEntityService.FindOneOptions} [options] - Optional options for checking the existence.
   * @returns {Promise<void>} - A Promise that resolves when the resource exists.
   * @throws {ResourceNotAvailableError} - If the resource does not exist.
   */
  async assert(id: string, options?: ElasticEntityService.FindOneOptions): Promise<void> {
    if (!(await this.exists(id, options))) throw new ResourceNotAvailableError(this.getResourceName(), id);
  }

  /**
   * Adds a document to the specified index
   *
   * @param {PartialDTO<T>} input - The input data for creating the document.
   * @param {ElasticEntityService.CreateOptions} [options] - The options for creating the document.
   * @returns {Promise<PartialDTO<T>>} A promise that resolves to the created document.
   * @throws {Error} if an unknown error occurs while creating the document.
   */
  async create(input: DTO<T>, options?: ElasticEntityService.CreateOptions): Promise<elastic.CreateResponse> {
    const command: ElasticEntityService.CreateCommand = {
      crud: 'create',
      method: 'createOnly',
      byId: false,
      input,
      options,
    };
    command.input._id = command.input._id ?? this._generateId(command);
    return this._executeCommand(command, () => this._create(command));
  }

  /**
   * Returns the count of documents in the collection based on the provided options.
   *
   * @param {ElasticEntityService.CountOptions<T>} options - The options for the count operation.
   * @return {Promise<number>} - A promise that resolves to the count of documents in the collection.
   */
  async count(options?: ElasticEntityService.CountOptions): Promise<number> {
    const command: ElasticEntityService.CountCommand = {
      crud: 'read',
      method: 'count',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      const r = await this._count(command);
      return r.count;
    });
  }

  /**
   * Deletes a document from the collection.
   *
   * @param {string} id - The ID of the document to delete.
   * @param {ElasticEntityService.DeleteOptions} [options] - Optional delete options.
   * @return {Promise<number>} - A Promise that resolves to the number of documents deleted.
   */
  async delete(id: string, options?: ElasticEntityService.DeleteOptions): Promise<elastic.DeleteByQueryResponse> {
    const command: ElasticEntityService.DeleteCommand = {
      crud: 'delete',
      method: 'delete',
      byId: true,
      documentId: id,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._delete(command);
    });
  }

  /**
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param {ElasticEntityService.DeleteManyOptions} options - The options for the delete operation.
   * @return {Promise<number>} - A promise that resolves to the number of documents deleted.
   */
  async deleteMany(options?: ElasticEntityService.DeleteManyOptions): Promise<elastic.DeleteByQueryResponse> {
    const command: ElasticEntityService.DeleteManyCommand = {
      crud: 'delete',
      method: 'deleteMany',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._deleteMany(command);
    });
  }

  /**
   * Checks if an object with the given id exists.
   *
   * @param {string} id - The id of the object to check.
   * @param {ElasticEntityService.FindOneOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async exists(id: string, options?: ElasticEntityService.FindOneOptions): Promise<boolean> {
    const command: ElasticEntityService.SearchCommand = {
      crud: 'read',
      method: 'exists',
      byId: true,
      documentId: id,
      options,
    };
    return this._executeCommand(command, async () => {
      const request = {
        ...command.options?.request,
        terminate_after: 1,
        size: 0,
      };
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...options, request, filter };
      const r = await this._search(command);
      return !!(typeof r.hits.total === 'number' ? r.hits.total : r.hits.total?.value);
    });
  }

  /**
   * Checks if an object with the given arguments exists.
   *
   * @param {ElasticEntityService.FindOneOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async existsOne(options?: ElasticEntityService.FindOneOptions): Promise<boolean> {
    const command: ElasticEntityService.SearchCommand = {
      crud: 'read',
      method: 'exists',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const request = {
        ...command.options?.request,
        terminate_after: 1,
        size: 0,
      };
      command.options = { ...options, request };
      const r = await this._search(command);
      return !!(typeof r.hits.total === 'number' ? r.hits.total : r.hits.total?.value);
    });
  }

  /**
   * Finds a document by its ID.
   *
   * @param {string} id - The ID of the document.
   * @param {ElasticEntityService.FindOneOptions} [options] - The options for the find query.
   * @return {Promise<PartialDTO<T | undefined>>} - A promise resolving to the found document, or undefined if not found.
   */
  async findById(
    id: string,
    options: RequiredSome<ElasticEntityService.FindOneOptions, 'projection'>,
  ): Promise<PartialDTO<T> | undefined>;
  /**
   * Finds a document by its ID.
   *
   * @param {string} id - The ID of the document.
   * @param {ElasticEntityService.FindOneOptions} [options] - The options for the find query.
   * @return {Promise<T | undefined>} - A promise resolving to the found document, or undefined if not found.
   */
  async findById(id: string, options?: ElasticEntityService.FindOneOptions): Promise<T | undefined>;
  /**
   *
   */
  async findById(id: string, options?: ElasticEntityService.FindOneOptions): Promise<PartialDTO<T> | T | undefined> {
    const command: ElasticEntityService.SearchCommand = {
      crud: 'read',
      method: 'findById',
      byId: true,
      documentId: id,
      options,
    };
    return this._executeCommand(command, async () => {
      const documentFilter = await this._getDocumentFilter(command);
      const filter = ElasticAdapter.prepareFilter([documentFilter, command.options?.filter]);
      const newCommand = {
        ...command,
        limit: 1,
        options: { ...command.options, filter },
      } as ElasticEntityService.SearchCommand;
      const r = await this._search(newCommand);
      if (r.hits.hits?.length) {
        const outputCodec = this._getOutputCodec('find');
        return {
          _id: r.hits.hits[0]._id,
          ...outputCodec(r.hits.hits[0]._source!),
        };
      }
    });
  }

  /**
   * Finds a document in the collection that matches the specified options.
   *
   * @param {ElasticEntityService.FindOneOptions} [options] - The options for the query.
   * @return {Promise<PartialDTO<T> | undefined>} A promise that resolves with the found document or undefined if no document is found.
   */
  async findOne(
    options: RequiredSome<ElasticEntityService.FindOneOptions, 'projection'>,
  ): Promise<PartialDTO<T> | undefined>;
  /**
   * Finds a document in the collection that matches the specified options.
   *
   * @param {ElasticEntityService.FindOneOptions} [options] - The options for the query.
   * @return {Promise<T | undefined>} A promise that resolves with the found document or undefined if no document is found.
   */
  async findOne(options?: ElasticEntityService.FindOneOptions): Promise<T | undefined>;
  /**
   *
   */
  async findOne(options?: ElasticEntityService.FindOneOptions): Promise<PartialDTO<T> | T | undefined> {
    const command: ElasticEntityService.SearchCommand = {
      crud: 'read',
      method: 'findOne',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      const newCommand = {
        ...command,
        limit: 1,
        options: { ...command.options, filter },
      } as ElasticEntityService.SearchCommand;
      const r = await this._search(newCommand);
      if (r.hits.hits?.length) {
        const outputCodec = this._getOutputCodec('find');
        return {
          _id: r.hits.hits[0]._id,
          ...outputCodec(r.hits.hits[0]._source!),
        };
      }
    });
  }

  /**
   * Finds multiple documents in the ElasticDB collection.
   *
   * @param {ElasticEntityService.SearchOptions} options - The options for the find operation.
   * @return {Promise<PartialDTO<T> | undefined>} A Promise that resolves to an array of partial outputs of type T.
   */
  async findMany(options: RequiredSome<ElasticEntityService.SearchOptions, 'projection'>): Promise<PartialDTO<T>[]>;
  /**
   * Finds multiple documents in the ElasticDB collection.
   *
   * @param {ElasticEntityService.SearchOptions} options - The options for the find operation.
   * @return {Promise<T | undefined>} A Promise that resolves to an array of partial outputs of type T.
   */
  async findMany(options?: ElasticEntityService.SearchOptions): Promise<T[]>;
  /**
   *
   */
  async findMany(options?: ElasticEntityService.SearchOptions): Promise<(PartialDTO<T> | T)[]> {
    const command: ElasticEntityService.SearchCommand = {
      crud: 'read',
      method: 'findMany',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      const limit = command.options?.limit || this.defaultLimit;
      command.options = { ...command.options, filter, limit };
      const r = await this._search(command);
      if (r.hits.hits?.length) {
        const outputCodec = this._getOutputCodec('find');
        return r.hits.hits.map((x: any) => ({
          _id: x._id,
          ...outputCodec(x._source!),
        }));
      }
      return [];
    });
  }

  /**
   * Finds multiple documents in the collection and returns both records (max limit)
   * and total count that matched the given criteria
   *
   * @param {ElasticEntityService.SearchOptions} [options] - The options for the find operation.
   * @return {ElasticCollectionService.FindManyWithCountResult<PartialDTO<T>>} A Promise that resolves to an array of partial outputs of type T.
   */
  async findManyWithCount(
    options: RequiredSome<ElasticEntityService.SearchOptions, 'projection'>,
  ): Promise<ElasticCollectionService.FindManyWithCountResult<PartialDTO<T>>>;
  /**
   * Finds multiple documents in the collection and returns both records (max limit)
   * and total count that matched the given criteria
   *
   * @param {ElasticEntityService.SearchOptions} [options] - The options for the find operation.
   * @return {ElasticCollectionService.FindManyWithCountResult<T>} A Promise that resolves to an array of partial outputs of type T.
   */
  async findManyWithCount(
    options?: ElasticEntityService.SearchOptions,
  ): Promise<ElasticCollectionService.FindManyWithCountResult<T>>;
  /**
   *
   */
  async findManyWithCount(options?: ElasticEntityService.SearchOptions): Promise<{
    count: number;
    items: (PartialDTO<T> | T)[];
  }> {
    const command: ElasticEntityService.SearchCommand = {
      crud: 'read',
      method: 'findManyWithCount',
      byId: false,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      const limit = command.options?.limit || this.defaultLimit;
      command.options = {
        ...command.options,
        filter,
        limit,
        request: { ...command.options?.request, track_total_hits: true },
      };
      const r = await this._search(command);
      const out = {} as ElasticCollectionService.FindManyWithCountResult<any>;
      if (r.hits.hits?.length) {
        const outputCodec = this._getOutputCodec('find');
        out.items = r.hits.hits.map((x: any) => ({
          _id: x._id,
          ...outputCodec(x._source!),
        }));
      } else out.items = [];
      if (typeof r.hits.total === 'object') {
        out.count = r.hits.total.value;
        out.relation = r.hits.total.relation;
      } else out.count = r.hits.total || 0;
      return out;
    });
  }

  /**
   * Retrieves a document from the collection by its ID. Throws error if not found.
   *
   * @param {string} id - The ID of the document to retrieve.
   * @param {ElasticEntityService.FindOneOptions<T>} [options] - Optional options for the findOne operation.
   * @returns {Promise<PartialDTO<T>>} - A promise that resolves to the retrieved document,
   *    or rejects with a ResourceNotFoundError if the document does not exist.
   * @throws {ResourceNotAvailableError} - If the document with the specified ID does not exist.
   */
  async get(
    id: string,
    options: RequiredSome<ElasticEntityService.FindOneOptions, 'projection'>,
  ): Promise<PartialDTO<T>>;
  /**
   * Retrieves a document from the collection by its ID. Throws error if not found.
   *
   * @param {string} id - The ID of the document to retrieve.
   * @param {ElasticEntityService.FindOneOptions<T>} [options] - Optional options for the findOne operation.
   * @returns {Promise<T>} - A promise that resolves to the retrieved document,
   *    or rejects with a ResourceNotFoundError if the document does not exist.
   * @throws {ResourceNotAvailableError} - If the document with the specified ID does not exist.
   */
  async get(id: string, options?: ElasticEntityService.FindOneOptions): Promise<T>;
  /**
   *
   */
  async get(id: string, options?: ElasticEntityService.FindOneOptions): Promise<PartialDTO<T> | T> {
    const out = await this.findById(id, options);
    if (!out) throw new ResourceNotAvailableError(this.getResourceName(), id);
    return out;
  }

  /**
   * Updates a document in the collection with the specified ID.
   *
   * @param {string} id - The ID of the document to update.
   * @param {PatchDTO<T>} input - The partial input data to update the document with.
   * @param {ElasticEntityService.UpdateOneOptions} [options] - The options for updating the document.
   * @returns {Promise<elastic.UpdateResponse>} - A promise that resolves to the number of documents modified.
   */
  async update(
    id: string,
    input: PatchDTO<T>,
    options?: ElasticEntityService.UpdateOneOptions,
  ): Promise<elastic.UpdateByQueryResponse> {
    const command: ElasticEntityService.UpdateCommand<T> = {
      crud: 'update',
      method: 'update',
      documentId: id,
      byId: true,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return await this._updateMany(command);
    });
  }

  /**
   * Updates multiple documents in the collection based on the specified input and options.
   *
   * @param {PatchDTO<T>} input - The partial input to update the documents with.
   * @param {ElasticEntityService.UpdateManyOptions} options - The options for updating the documents.
   * @return {Promise<number>} - A promise that resolves to the number of documents matched and modified.
   */
  async updateMany(
    input: PatchDTO<T>,
    options?: ElasticEntityService.UpdateManyOptions,
  ): Promise<elastic.UpdateByQueryResponse> {
    const command: ElasticEntityService.UpdateCommand<T> = {
      crud: 'update',
      method: 'updateMany',
      byId: false,
      input,
      options,
    };
    return this._executeCommand(command, async () => {
      const filter = ElasticAdapter.prepareFilter([await this._getDocumentFilter(command), command.options?.filter]);
      command.options = { ...command.options, filter };
      return this._updateMany(command);
    });
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
    command: ElasticService.CommandInfo,
  ): ElasticAdapter.FilterInput | Promise<ElasticAdapter.FilterInput> | undefined {
    const commonFilter = Array.isArray(this.documentFilter) ? this.documentFilter : [this.documentFilter];
    const mapped = commonFilter.map(f =>
      typeof f === 'function' ? f(command, this) : f,
    ) as ElasticAdapter.FilterInput[];
    return mapped.length > 1 ? ElasticAdapter.prepareFilter(mapped) : mapped[0];
  }
}
