import { Type } from 'ts-gems';
import { ComparisonOperator, Expression } from '@opra/url';

export namespace OpraSchema {

  /**
   * *** === Constants === ***
   */

  export const Version = '1.0';


  /**
   * *** === Type definitions === ***
   */

  export type Extensible<T = any> = { [key: `$${string}`]: T };
  export type ResourceKind = 'ContainerResource' | 'EntityResource' | 'SingletonResource';
  export type DataTypeKind = 'SimpleType' | 'ComplexType';
  export type OperationType = 'create' | 'read' | 'update' | 'patch' | 'delete' | 'execute';
  export type QueryScope = 'collection' | 'instance' | 'field';
  export type EntityMethod = 'search' | 'count' | 'get' | 'create' | 'update' | 'updateMany' | 'delete' | 'deleteMany';
  export type QueryMethod = EntityMethod | 'metadata' | 'execute';
  export type KeyValue = string | number | boolean | object;


  /**
   * *** === Document related === ***
   */

  export interface Document {
    version: string; // Spec version = 1.0
    info: DocumentInfo;
    references?: Record<string, Reference>;
    types: DataType[];
  }

  export type Reference = Extensible & {
    url?: string;
    document?: Document;
  }

  export type DocumentInfo = Extensible & {
    title: string;
    version: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactPerson[];
    license?: LicenseInfo;
  }

  export type ContactPerson = Extensible & {
    name?: string;
    email?: string;
    url?: string;
  }

  export type LicenseInfo = Extensible & {
    name: string;
    url?: string;
    content?: string;
  }


  /**
   * *** === Service related === ***
   */

  export interface Service extends Document {
    resources: Resource[];
    servers?: ServerInfo[];
  }

  export type ServerInfo = Extensible & {
    url: string;
    description?: string;
  }


  /**
   * *** === Data Type related === ***
   */

  export type DataType = ComplexType | SimpleType;

  export type BaseDataType = {
    kind: DataTypeKind;
    name: string;
    description?: string;
    ctor?: Type;
    parse?: (v: any) => any;
  }

  export interface SimpleType extends BaseDataType {
    kind: 'SimpleType';
    type: 'boolean' | 'number' | 'integer' | 'string';
    format?: string;
    default?: boolean | number | string;
    enum?: string[] | Record<string, string>;
    enumDescriptions?: Record<string, string>;
  }

  export interface ComplexType extends BaseDataType {
    kind: 'ComplexType';
    description?: string;
    abstract?: boolean;
    extends?: ComplexTypeExtendingInfo[];
    fields?: Record<string, Field>;
    additionalFields?: boolean | string | Pick<Field, 'type' | 'format' | 'isArray' | 'enum'>;
  }

  export interface ComplexTypeExtendingInfo {
    type: 'string';
    pick?: string[];
    omit?: string[];
  }

  export type Field = Extensible & {
    type: string;
    description?: string;
    optional?: boolean;
    isArray?: boolean;
    format?: string;
    default?: any;
    fixed?: string | number;
    enum?: string | string[] | Record<string, string>;
    enumName?: string;
    examples?: any[] | Record<string, any>;
    deprecated?: boolean | string;

    /**
     * If true, this property will not be included in results by default.
     * The client side should include the property name in the "include" query parameter.
     */
    exclusive?: boolean;

    // rules
    // nullable?: boolean;
    // readOnly?: boolean;
    // writeOnly?: boolean;
    // required?: boolean;
  }


  /**
   * *** === Resource related === ***
   */

  export type Resource = ContainerResource | EntityResource | SingletonResource;

  export interface BaseResource {
    kind: ResourceKind;
    name: string;
    description?: string;
    instance?: {};
  }

  export interface EntityResource extends BaseResource {
    kind: 'EntityResource',
    type: string;
    keyFields: string | string[];
    methods: {
      create?: CreateMethodResolver;
      count?: CountMethodResolver;
      delete?: DeleteMethodResolver;
      deleteMany?: DeleteManyMethodResolver;
      get?: GetMethodResolver;
      update?: UpdateMethodResolver;
      updateMany?: UpdateManyMethodResolver;
      search?: SearchMethodResolver;
    };
  }

  export type MethodResolver = {
    handler?: Function;
  }

  type MethodResolverInputOptions = {
    inputPick?: string[];
    inputOmit?: string[];
  }

  type MethodResolverOutputOptions = {
    outputPick?: string[];
    outputOmit?: string[];
  }

  type MethodResolverFilterOptions = {
    filters?: { field: string, operators?: ComparisonOperator[] }[]
  }

  export type CreateMethodResolver = MethodResolver & MethodResolverInputOptions & MethodResolverOutputOptions;
  export type CountMethodResolver = MethodResolver & {};
  export type DeleteMethodResolver = MethodResolver & {};
  export type DeleteManyMethodResolver = MethodResolver & MethodResolverFilterOptions;
  export type GetMethodResolver = MethodResolver & MethodResolverOutputOptions;
  export type UpdateMethodResolver = MethodResolver & MethodResolverInputOptions & MethodResolverOutputOptions;
  export type UpdateManyMethodResolver = MethodResolver & MethodResolverFilterOptions;
  export type SearchMethodResolver = MethodResolver & MethodResolverOutputOptions & {
    sortFields?: string[];
    defaultSort?: string[];
  } & MethodResolverFilterOptions;

  export interface SingletonResource extends BaseResource {
    kind: 'SingletonResource',
    type: string;
  }

  export interface ContainerResource extends BaseResource {
    kind: 'ContainerResource',
    resources: Resource[];
  }


  /**
   * *** === Query related === ***
   */

  export type AnyQuery = GetMetadataQuery |
      CreateInstanceQuery | GetInstanceQuery | UpdateInstanceQuery | DeleteInstanceQuery |
      DeleteCollectionQuery | SearchCollectionQuery | UpdateCollectionQuery;

  interface BaseQuery {
    method: QueryMethod;
    scope: QueryScope;
    operation: OperationType;
  }

  export interface GetMetadataQuery extends BaseQuery {
    method: 'metadata';
    scope: QueryScope;
    operation: 'read';
    resourcePath?: string[];
  }

  export interface CreateInstanceQuery extends BaseQuery {
    method: 'create';
    scope: 'collection';
    operation: 'create';
    resource: EntityResource;
    data: {};
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface GetInstanceQuery extends BaseQuery {
    method: 'get';
    scope: 'instance';
    operation: 'read';
    resource: EntityResource;
    keyValue: KeyValue;
    pick?: string[];
    omit?: string[];
    include?: string[];
    nested?: GetFieldQuery;
  }

  export interface GetFieldQuery extends BaseQuery {
    method: 'get';
    scope: 'field';
    operation: 'read';
    fieldName: string;
    pick?: string[];
    omit?: string[];
    include?: string[];
    nested?: GetFieldQuery;
  }

  export interface UpdateInstanceQuery extends BaseQuery {
    method: 'update';
    scope: 'instance';
    operation: 'update';
    resource: EntityResource;
    keyValue: KeyValue;
    data: {};
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface UpdateCollectionQuery extends BaseQuery {
    method: 'updateMany';
    scope: 'collection';
    operation: 'update';
    resource: EntityResource;
    filter?: string | Expression;
    data: {};
  }

  export interface DeleteInstanceQuery extends BaseQuery {
    method: 'delete';
    scope: 'instance';
    operation: 'delete';
    resource: EntityResource;
    keyValue: KeyValue;
  }

  export interface DeleteCollectionQuery extends BaseQuery {
    method: 'deleteMany';
    scope: 'collection';
    operation: 'delete';
    resource: EntityResource;
    filter?: string | Expression;
  }

  export interface SearchCollectionQuery extends BaseQuery {
    method: 'search';
    scope: 'collection';
    operation: 'read';
    resource: EntityResource;
    pick?: string[];
    omit?: string[];
    include?: string[];
    filter?: string | Expression;
    limit?: number;
    skip?: number;
    distinct?: boolean;
    count?: boolean;
    sort?: string[];
  }

  export interface CountCollectionQuery extends BaseQuery {
    method: 'count';
    scope: 'collection';
    operation: 'read';
    resource: EntityResource;
    filter?: string | Expression;
  }

  /**
   * *** === Type Guards === ***
   */

  export function isDataType(obj: any): obj is DataType {
    return obj && typeof obj === 'object' &&
        (obj.kind === 'ComplexType' || obj.kind === 'SimpleType');
  }

  export function isComplexType(obj: any): obj is ComplexType {
    return obj && typeof obj === 'object' && obj.kind === 'ComplexType';
  }

  export function isSimpleType(obj: any): obj is SimpleType {
    return obj && typeof obj === 'object' && obj.kind === 'SimpleType';
  }


  export function isResource(obj: any): obj is Resource {
    return obj && typeof obj === 'object' &&
        obj.kind === 'ContainerResource' ||
        obj.kind === 'EntityResource' ||
        obj.kind === 'SingletonResource';
  }

  export function isEntityResource(obj: any): obj is EntityResource {
    return obj && typeof obj === 'object' && obj.kind === 'EntityResource';
  }

  export function isSingletonResource(obj: any): obj is SingletonResource {
    return obj && typeof obj === 'object' && obj.kind === 'SingletonResource';
  }

  export function isContainerResource(obj: any): obj is ContainerResource {
    return obj && typeof obj === 'object' && obj.kind === 'ContainerResource';
  }

  export function isGetMetadataQuery(q: any): q is GetMetadataQuery {
    return q && typeof q === 'object' &&
        q.scope === 'instance' &&
        q.method === 'metadata' &&
        q.operation === 'read';
  }


  export function isCreateInstanceQuery(q: any): q is CreateInstanceQuery {
    return q && typeof q === 'object' &&
        q.scope === 'collection' &&
        q.method === 'create' &&
        q.operation === 'create';
  }

  export function isGetInstanceQuery(q: any): q is GetInstanceQuery {
    return q && typeof q === 'object' &&
        q.scope === 'instance' &&
        q.method === 'get' &&
        q.operation === 'read';
  }


  export function isDeleteInstanceQuery(q: any): q is DeleteInstanceQuery {
    return q && typeof q === 'object' &&
        q.scope === 'instance' &&
        q.method === 'delete' &&
        q.operation === 'delete';
  }

  export function isSearchCollectionQuery(q: any): q is SearchCollectionQuery {
    return q && typeof q === 'object' && q.scope === 'collection' && q.method === 'search';
  }


}
