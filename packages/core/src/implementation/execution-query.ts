import { Maybe } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import type { OperationLevel, OperationMethod, OperationType } from '../types';
import { ComplexType } from './data-type/complex-type';
import type { DataType } from './data-type/data-type';
import { OpraService } from './opra-service';
import { EntityResource } from './resource/entity-resource';
import Property = OpraSchema.Property;
import { Responsive, ResponsiveObject } from '../helpers/responsive-object';
import { ObjectTree, stringPathToObjectTree } from './adapter/utils/string-path-to-object-tree';

export type ExecutionQueryProjection = ResponsiveObject<ExecutionQuery | boolean>;

export class ExecutionQuery {
  protected _parent?: ExecutionQuery;
  protected _service: OpraService;
  protected _operationType: OperationType;
  protected _operationMethod: OperationMethod;
  protected _operationLevel: OperationLevel;
  protected _subject: string;
  protected _key?: any;
  protected _dataType: DataType;
  protected _property?: Property;
  protected _projection: ExecutionQueryProjection = Responsive<ExecutionQuery | boolean>();
  protected _limit?: number;
  protected _skip?: number;
  protected _distinct?: boolean;
  protected _total?: boolean;

  protected constructor(parent: OpraService | ExecutionQuery, subject: string) {
    this._service = parent instanceof ExecutionQuery ? parent.service : parent;
    this._parent = parent instanceof ExecutionQuery ? parent : undefined;
    this._subject = subject;
  }

  get service(): OpraService {
    return this._service;
  }

  get operationType(): OperationType {
    return this._operationType;
  }

  get operationMethod(): OperationMethod {
    return this._operationMethod;
  }

  get operationLevel(): OperationLevel {
    return this._operationLevel;
  }

  get subject(): string {
    return this._subject;
  }

  get key(): any {
    return this._key;
  }

  set key(v: any) {
    this._key = v;
  }

  get path(): string {
    return (this.parent?.path || '/') + this._subject;
  }

  get parent(): Maybe<ExecutionQuery> {
    return this._parent;
  }

  get dataType(): DataType {
    return this._dataType;
  }

  get property(): Maybe<Property> {
    return this._property;
  }

  get projection(): ExecutionQueryProjection {
    return this._projection;
  }

  get limit(): Maybe<number> {
    return this._limit;
  }

  set limit(v: Maybe<number>) {
    this._limit = v;
  }

  get skip(): Maybe<number> {
    return this._skip;
  }

  set skip(v: Maybe<number>) {
    this._skip = v;
  }

  get distinct(): Maybe<boolean> {
    return this._distinct;
  }

  set distinct(v: Maybe<boolean>) {
    this._distinct = v;
  }

  get total(): Maybe<boolean> {
    return this._total;
  }

  set total(v: Maybe<boolean>) {
    this._total = v;
  }

  addProperty(propertyName: string): ExecutionQuery | string {
    if (!(this.dataType instanceof ComplexType))
      throw new TypeError(`"${this.path}" is not a ComplexType and have no properties`);

    const prop = this.dataType.properties?.[propertyName];
    if (!prop) {
      if (this.dataType.additionalProperties) {
        this._projection[propertyName] = this._projection[propertyName] || true;
        return propertyName;
      }
      throw new Error(`"${this.path}" has no property named "${propertyName}".`);
    }

    const propType = this.service.getDataType(prop.type || 'string');
    if (propType instanceof ComplexType) {
      const subQuery = ExecutionQuery.createForProperty(this, prop);
      this._projection[prop.name] = subQuery;
      return subQuery;
    } else {
      this._projection[prop.name] = true;
      return prop.name;
    }
  }

  setProjection(elements?: string[], exclude?: string[], include?: string[]): void {
    const _elementsTree = elements && stringPathToObjectTree(elements);
    const _excludeTree = exclude && stringPathToObjectTree(exclude);
    const _includeTree = include && stringPathToObjectTree(include);
    this._setProjectionFor(this, _elementsTree, _includeTree, _excludeTree);
  }

  protected _setProjectionFor(
      node: ExecutionQuery,
      elementsTree?: ObjectTree,
      includeTree?: ObjectTree,
      excludeTree?: ObjectTree,
  ): void {
    const dataType = node._dataType;
    /* istanbul ignore next */
    if (!(dataType instanceof ComplexType))
      throw new TypeError(`${dataType?.name} is not a ComplexType`);

    let treeNode = elementsTree;
    if (!treeNode) {
      if (dataType.properties)
        treeNode = stringPathToObjectTree(Object.keys(dataType.properties)) as ObjectTree;
      else return;
    }
    elementsTree = elementsTree || {};
    includeTree = includeTree || {};
    excludeTree = excludeTree || {};

    const parentPath = node.path;
    for (const k of Object.keys(treeNode)) {
      if (excludeTree?.[k])
        continue;

      const prop = dataType.properties?.[k];
      if (prop?.exclusive && !(elementsTree[k] || includeTree[k]))
        continue;

      const sub = this.addProperty(k);
      if (sub instanceof ExecutionQuery) {
        this._setProjectionFor(sub,
            typeof elementsTree[k] === 'object' ? elementsTree[k] as ObjectTree : undefined,
            typeof excludeTree[k] === 'object' ? excludeTree?.[k] as ObjectTree : undefined,
            typeof includeTree[k] === 'object' ? includeTree?.[k] as ObjectTree : undefined
        );
      } else {
        if (typeof treeNode[k] === 'object' && typeof sub !== 'object')
          throw new TypeError(`"${(parentPath ? parentPath + '.' : '') + k}" is not a ComplexType and have no properties`);
        node._projection[k] = node._projection[k] || true;
      }
    }
  }

  static createForCollection(parent: OpraService | ExecutionQuery,
                             operationMethod: OperationMethod,
                             resourceName: string): ExecutionQuery {
    const query = new ExecutionQuery(parent, resourceName);
    query._operationMethod = operationMethod;
    query._operationLevel = 'collection';
    const resource = query.service.getResource(resourceName);
    query._dataType = resource.dataType;
    switch (operationMethod) {
      case 'read':
        query._operationType = 'search';
        break;
      case 'create':
        query._operationType = 'create';
        break;
      case 'update':
        query._operationType = 'update-many';
        break;
      case 'patch':
        query._operationType = 'patch-many';
        break;
      case 'delete':
        query._operationType = 'delete-many';
        break;
      default:
        /* istanbul ignore next */
        throw new TypeError(`Invalid operation method (${operationMethod}) for ${query.operationLevel} level query`);
    }
    return query;
  }

  static createForInstance(parent: OpraService | ExecutionQuery,
                           operationMethod: OperationMethod,
                           resourceName: string,
                           key: any): ExecutionQuery {
    const query = new ExecutionQuery(parent, resourceName);
    query._operationMethod = operationMethod;
    query._operationLevel = 'instance';
    const resource = query.service.getResource(resourceName);
    query._dataType = resource.dataType;
    if (resource instanceof EntityResource) {
      if (!resource.primaryKey)
        throw new Error(`"${resource.name}" resource doesn't support instance level queries`);
      query._key = {};
      (Array.isArray(resource.primaryKey) ? resource.primaryKey : [resource.primaryKey])
          .forEach((k, i) => {
            if (typeof key === 'object') {
              query._key[k] = key[k];
            } else if (i === 0)
              query._key[k] = key;
            else throw new Error(`You must provide all primary key values (${resource.primaryKey})`);
          });
    } else
      throw new TypeError(`"${resource.name}" resource does not support instance level queries`);
    switch (operationMethod) {
      case 'read':
        query._operationType = 'get';
        break;
      case 'update':
        query._operationType = 'update';
        break;
      case 'patch':
        query._operationType = 'patch';
        break;
      case 'delete':
        query._operationType = 'delete';
        break;
      case 'execute':
        query._operationType = 'execute';
        break;
      default:
        /* istanbul ignore next */
        throw new TypeError(`Invalid operation method (${operationMethod}) for ${query.operationLevel} level query`);
    }
    return query;
  }

  static createForProperty(parent: ExecutionQuery,
                           property: OpraSchema.Property) {
    if (!(parent.dataType instanceof ComplexType))
      throw new Error(`"${parent.subject}" is not a ComplexType and has no properties.`);
    if (parent.operationMethod !== 'read')
      throw new Error(`You can't add sub query into "${parent.operationType}" operation query.`);
    const prop = parent.dataType.properties?.[property.name];
    if (!prop)
      throw new Error(`"${parent.path}" has no property named "${property}".`);
    const query = new ExecutionQuery(parent, property.name);
    query._operationMethod = 'read';
    query._operationLevel = 'property';
    query._operationType = 'get';
    query._property = {...property};
    query._dataType = query.service.getDataType(property.type || 'string');
    return query;
  }

}
