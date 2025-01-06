import { ApiField, ComplexType } from '@opra/common';
import type { UpdateFilter } from 'mongodb';
import type { PatchDTO } from 'ts-gems';

interface Context {
  $set?: Record<string, any>;
  $unset?: Record<string, any>;
  $push?: Record<string, any>;
  $pull?: Record<string, any>;
  arrayFilters?: Record<string, any>[];
  initArrayFields?: string[];
}

const FIELD_NAME_PATTERN = /^([-><*:])?(.+)$/;

export class MongoPatchGenerator {
  generatePatch<T extends object>(
    dataType: ComplexType,
    doc: PatchDTO<T>,
    options?: MongoPatchGenerator.Options,
  ): {
    update: UpdateFilter<T>;
    arrayFilters?: Record<string, any>[];
    initArrayFields?: string[];
  } {
    const ctx: Context = {};
    this._processComplexType(
      ctx,
      dataType,
      options?.currentPath || '',
      doc,
      options?.scope,
    );
    const update: any = {};
    if (ctx.$pull) update.$pull = ctx.$pull;
    if (ctx.$unset) update.$unset = ctx.$unset;
    if (ctx.$set) update.$set = ctx.$set;
    if (ctx.$push) update.$push = ctx.$push;
    return {
      update,
      arrayFilters: ctx.arrayFilters,
      initArrayFields: ctx.initArrayFields,
    };
  }

  protected _processComplexType(
    ctx: Context,
    dataType: ComplexType,
    path: string,
    input: any,
    scope?: string,
  ): boolean {
    let result = false;
    if (input._$push) {
      result =
        result || this._processPush(ctx, dataType, path, input._$push, scope);
    }
    if (input._$pull) {
      result =
        result || this._processPull(ctx, dataType, path, input._$pull, scope);
    }
    const keys = Object.keys(input);
    const pathDot = path + (path ? '.' : '');
    let field: ApiField | undefined;
    let key: string;
    let value: any;
    let keyField: string | undefined;
    let keyValue: any;
    let arrayIndex = 0;
    let arrayFilterName = '';
    for (key of keys) {
      const m = FIELD_NAME_PATTERN.exec(key);
      if (!m) continue;
      key = m[2];
      if (key === '_$push' || key === '_$pull') continue;
      value = input[key];
      field = dataType.findField(key, scope);
      if (field && !field.inScope(scope)) continue;
      if (!field) {
        if (dataType.additionalFields) {
          if (value === null) {
            ctx.$unset = ctx.$unset || {};
            ctx.$unset[pathDot + key] = 1;
            result = true;
          } else {
            ctx.$set = ctx.$set || {};
            if (dataType.additionalFields instanceof ComplexType) {
              /** Process nested object */
              if (
                this._processComplexType(
                  ctx,
                  dataType.additionalFields,
                  pathDot + key,
                  value,
                  scope,
                )
              ) {
                result = true;
              }
              continue;
            }
            ctx.$set[pathDot + key] = value;
            result = true;
          }
        }
        continue;
      }
      // if (field.readonly) continue; todo
      if (value === null) {
        ctx.$unset = ctx.$unset || {};
        ctx.$unset[pathDot + field.name] = 1;
        result = true;
        continue;
      }
      if (field.type instanceof ComplexType) {
        if (!value) continue;
        if (field.isArray) {
          ctx.initArrayFields = ctx.initArrayFields || [];
          ctx.initArrayFields.push(pathDot + field.name);
          if (!value.length) continue;
          keyField = field.keyField || field.type.keyField;
          if (keyField) {
            for (let v of value) {
              /** Increase arrayIndex and determine a new name for array filter  */
              arrayFilterName = 'f' + String(++arrayIndex);
              /** Extract key value from object */
              keyValue = v[keyField];
              if (keyValue == null) continue;
              v = { ...v };
              /** Remove key field from object */
              delete v[keyField];
              /** Process each object in array */
              if (
                this._processComplexType(
                  ctx,
                  field.type,
                  pathDot + field.name + `.$[${arrayFilterName}]`,
                  v,
                  scope,
                )
              ) {
                result = true;
                /** Add array filter */
                ctx.arrayFilters = ctx.arrayFilters || [];
                ctx.arrayFilters.unshift({
                  [`${arrayFilterName}.${keyField}`]: keyValue,
                });
              }
            }
            continue;
          }
        }
        if (!(typeof value === 'object')) continue;
        /** Process nested object */
        if (
          this._processComplexType(
            ctx,
            field.type,
            pathDot + field.name,
            value,
            scope,
          )
        ) {
          result = true;
        }
        continue;
      }
      ctx.$set = ctx.$set || {};
      ctx.$set[pathDot + field.name] = value;
      result = true;
    }
    return result;
  }

  protected _processPush(
    ctx: Context,
    dataType: ComplexType,
    path: string,
    input: any,
    scope?: string,
  ): boolean {
    let result = false;
    let field: ApiField | undefined;
    let key: string;
    let value: any;
    const pathDot = path + (path ? '.' : '');
    const keys = Object.keys(input);
    let keyField: string | undefined;
    for (key of keys) {
      value = input[key];
      field = dataType.getField(key, scope);
      if (!(field && field.isArray)) continue;
      ctx.$push = ctx.$push || {};
      if (field.type instanceof ComplexType) {
        keyField = field.keyField || field.type.keyField;
        if (keyField) {
          if (Array.isArray(value)) {
            value.forEach(v => {
              if (!v[keyField!]) {
                throw new TypeError(
                  `You must provide a key value of ${field!.type.name} for $push operation.`,
                );
              }
            });
            ctx.$push[pathDot + key] = { $each: value };
            result = true;
          } else {
            if (!value[keyField]) {
              throw new TypeError(
                `You must provide a key value of ${field!.type.name} for $push operation.`,
              );
            }
            ctx.$push[pathDot + key] = value;
            result = true;
          }
        }
        continue;
      }
      ctx.$push[pathDot + key] = Array.isArray(value)
        ? { $each: value }
        : value;
      result = true;
    }
    return result;
  }

  protected _processPull(
    ctx: Context,
    dataType: ComplexType,
    path: string,
    input: any,
    scope?: string,
  ): boolean {
    let result = false;
    let field: ApiField | undefined;
    let key: string;
    let value: any;
    const pathDot = path + (path ? '.' : '');
    const keys = Object.keys(input);
    let keyField: string | undefined;
    for (key of keys) {
      value = input[key];
      field = dataType.getField(key, scope);
      if (!(field && field.isArray)) continue;
      ctx.$pull = ctx.$pull || {};
      if (field.type instanceof ComplexType) {
        keyField = field.keyField || field.type.keyField;
        if (!keyField) continue;
        ctx.$pull[pathDot + key] = {
          $elemMatch: {
            [keyField]: Array.isArray(value) ? { $in: value } : value,
          },
        };
        result = true;
      } else {
        ctx.$pull[pathDot + key] = Array.isArray(value)
          ? { $in: value }
          : value;
        result = true;
      }
    }
    return result;
  }
}

export namespace MongoPatchGenerator {
  export interface Options {
    currentPath?: string;
    scope?: string;
  }
}
