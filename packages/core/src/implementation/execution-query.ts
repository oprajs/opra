/*

import { Maybe } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { SearchParams } from '@opra/url';
import { Responsive, ResponsiveObject } from '../helpers/responsive-object.js';
import type { OperationScope, OperationMethod, OperationType } from '../types.js';
import { ObjectTree, stringPathToObjectTree } from './adapter/utils/string-path-to-object-tree.js';
import { ComplexType } from './data-type/complex-type.js';
import type { DataType } from './data-type/data-type.js';
import { OpraService } from './opra-service.js';
import { EntityResourceController } from './resource/entity-resource-controller.js';


export type ExecutionQueryProjection = ResponsiveObject<ExecutionQuery | boolean>;
const DOT_NOTATION_PATTERN = /^([^.]+)(\..*)?$/;


export class ExecutionQuery_ {
  protected _parent?: ExecutionQuery;
  protected _service: OpraService;
  protected _operationMethod: OperationMethod;
  protected _operationType: OperationType;
  protected _operationLevel: OperationScope;
  protected _subject: string;
  protected _key?: any;
  protected _dataType: ComplexType;
  protected _property?: OpraSchema.Property;

  protected _pickFields?: string[];
  protected _omitFields?: string[];
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

  get operationMethod(): OperationMethod {
    return this._operationMethod;
  }

  get operationType(): OperationType {
    return this._operationType;
  }

  get operationLevel(): OperationScope {
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

  get pickFields(): string[] {
    return Array.from(this._pick);
  }

  pickField(...fields: string[]): this {
    this._addToFieldSet(this._pick, fields);
    return this;
  }

  omitField(...fields: string[]): this {
    this._addToFieldSet(this._omit, fields);
    return this;
  }

  protected _addToFieldSet(set: Set<string>, fields: string[]) {
    for (let field of fields) {
      field = this._normalizeFieldPath(this.dataType, field);
      const _field = field.toLowerCase();
      let _skip = false;

      for (let x of set) {
        x = x.toLowerCase();
        if (x === _field || _field.startsWith(x + '.')) {
          _skip = true;
          continue;
        }
        if (x.startsWith(_field + '.')) {
          set.delete(x);
        }
      }
      if (!_skip)
        set.add(field);
    }
  }

  protected _normalizeFieldPath(dataType: DataType, path: string): string {
    if (!(dataType instanceof ComplexType))
      throw new TypeError(`"${this.path}" is not a ComplexType and have no properties`);

    const m = DOT_NOTATION_PATTERN.exec(path);
    /* istanbul ignore next: impossible to occur * /
    if (!m)
      throw new Error(`Invalid path`);

    let left = m[1];
    let right = m[2];
    const prop = dataType.properties?.[left];
    if (!prop) {
      if (dataType.additionalProperties)
        return path;
      throw new Error(`Unknown property (${m[0]})`);
    }
    left = prop.name;

    if (right) {
      const propType = this.service.getDataType(prop.type || 'string');
      right = this._normalizeFieldPath(propType, right);
    }
    return left + (right ? '.' + right : '');
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

  setProjection(fields?: string[], exclude?: string[], include?: string[]): void {
    const _fieldsTree = fields && stringPathToObjectTree(fields);
    const _excludeTree = exclude && stringPathToObjectTree(exclude);
    const _includeTree = include && stringPathToObjectTree(include);
    this._setProjectionFor(this, _fieldsTree, _includeTree, _excludeTree);
  }

  getProjectionFields(): string[] {
    const out: string[] = [];
    const processTree = (path: string, node: ExecutionQuery) => {
      const keys = Object.keys(node.projection);
      for (const k of keys) {
        const v = this.projection[k];
        const subPath = path ? (path + '.' + k) : k;
        if (v instanceof ExecutionQuery) {
          const l = out.length;
          processTree(subPath, v);
          if (l === out.length)
            out.push(subPath);
          continue;
        }
        out.push(subPath);
      }
    }
    processTree('', this);
    return out;
  }

  protected _setProjectionFor(
      node: ExecutionQuery,
      fieldsTree?: ObjectTree,
      includeTree?: ObjectTree,
      excludeTree?: ObjectTree,
  ): void {
    const dataType = node._dataType;
    /* istanbul ignore next * /
    if (!(dataType instanceof ComplexType))
      throw new TypeError(`${dataType?.name} is not a ComplexType`);

    let treeNode = fieldsTree;
    if (!treeNode) {
      if (dataType.properties)
        treeNode = stringPathToObjectTree(Object.keys(dataType.properties)) as ObjectTree;
      else return;
    }
    fieldsTree = fieldsTree || {};
    includeTree = includeTree || {};
    excludeTree = excludeTree || {};

    const parentPath = node.path;
    for (const k of Object.keys(treeNode)) {
      if (excludeTree?.[k])
        continue;

      const prop = dataType.properties?.[k];
      if (prop?.exclusive && !(fieldsTree[k] || includeTree[k]))
        continue;

      const sub = this.addProperty(k);
      if (sub instanceof ExecutionQuery) {
        this._setProjectionFor(sub,
            typeof fieldsTree[k] === 'object' ? fieldsTree[k] as ObjectTree : undefined,
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
                             operationType: OperationType,
                             resourceName: string
  ): ExecutionQuery {
    const query = new ExecutionQuery(parent, resourceName);
    query._operationType = operationType;
    query._operationLevel = 'collection';
    const resource = query.service.getResource(resourceName);
    query._dataType = resource.dataType;
    switch (operationType) {
      case 'read':
        query._operationMethod = 'search';
        break;
      case 'create':
        query._operationMethod = 'create';
        break;
      case 'update':
        query._operationMethod = 'updateMany';
        break;
      case 'patch':
        query._operationMethod = 'patchMany';
        break;
      case 'delete':
        query._operationMethod = 'deleteMany';
        break;
      default:
        /* istanbul ignore next * /
        throw new TypeError(`Invalid operation type (${operationType}) for ${query.operationLevel} level query`);
    }
    return query;
  }

  static createForInstance(parent: OpraService | ExecutionQuery,
                           operationType: OperationType,
                           resourceName: string,
                           key: any): ExecutionQuery {
    const query = new ExecutionQuery(parent, resourceName);
    query._operationType = operationType;
    query._operationLevel = 'instance';
    const resource = query.service.getResource(resourceName);
    query._dataType = resource.dataType;
    if (resource instanceof EntityResourceController) {
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
    switch (operationType) {
      case 'read':
        query._operationMethod = 'read';
        break;
      case 'update':
        query._operationMethod = 'update';
        break;
      case 'patch':
        query._operationMethod = 'patch';
        break;
      case 'delete':
        query._operationMethod = 'delete';
        break;
      case 'execute':
        query._operationMethod = 'execute';
        break;
      default:
        /* istanbul ignore next * /
        throw new TypeError(`Invalid operation type (${operationType}) for ${query.operationLevel} level query`);
    }
    return query;
  }

  static createForProperty(parent: ExecutionQuery,
                           property: OpraSchema.Property) {
    if (!(parent.dataType instanceof ComplexType))
      throw new Error(`"${parent.subject}" is not a ComplexType and has no properties.`);
    if (parent.operationType !== 'read')
      throw new Error(`You can't add sub query into "${parent.operationMethod}" operation query.`);
    const prop = parent.dataType.properties?.[property.name];
    if (!prop)
      throw new Error(`"${parent.path}" has no property named "${property}".`);
    const query = new ExecutionQuery(parent, property.name);
    query._operationType = 'read';
    query._operationLevel = 'property';
    query._operationMethod = 'read';
    query._property = {...property};
    query._dataType = query.service.getDataType(property.type || 'string');
    return query;
  }

}
*/
