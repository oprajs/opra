import { vg } from 'valgen';
import { BadRequestError } from '../../exception/index.js';
import { OpraFilter } from '../../filter/index.js';
import { translate } from '../../i18n/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { SORT_FIELD_PATTERN } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { SimpleType } from '../data-type/simple-type.js';
import type { Collection } from './collection.js';
import type { Container } from './container.js';
import { CrudResource } from './crud-resource.js';

export class CollectionClass extends CrudResource {
  readonly kind: OpraSchema.Resource.Kind = OpraSchema.Collection.Kind;
  readonly type: ComplexType;
  readonly primaryKey: string[];

  constructor(parent: ApiDocument | Container, init: Collection.InitArguments) {
    super(parent, init);
    const dataType = this.type = init.type;
    // Validate key fields
    this.primaryKey = init.primaryKey
        ? (Array.isArray(init.primaryKey) ? init.primaryKey : [init.primaryKey])
        : [];
    if (!this.primaryKey.length)
      throw new TypeError(`You must provide primaryKey for Collection resource ("${this.name}")`);
    this.primaryKey.forEach(f => {
      const field = dataType.getField(f);
      if (!(field?.type instanceof SimpleType))
        throw new TypeError(`Only Simple type allowed for primary keys but "${f}" is a ${field.type.kind}`);
    });
    // ------------------
    let endpoint = this.operations.get('create');
    if (endpoint) {
      // endpoint.defineParameter('metadata', {enum: MetadataMode, isBuiltin: true, default: 'minimal'});
      endpoint.defineParameter('pick', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('omit', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('include', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.decodeInput = this.type.generateCodec('decode', {
        partial: false,
        pick: endpoint.options.inputPickFields,
        omit: endpoint.options.inputOmitFields,
        operation: 'write',
        overwriteFields: endpoint.inputOverwriteFields
      })
      endpoint.response.type = this.type;
      (endpoint.response as any)._encoder = endpoint.response.type.generateCodec('encode', {
        partial: true,
        pick: endpoint.options.outputPickFields,
        omit: endpoint.options.outputOmitFields,
        operation: 'read',
        overwriteFields: endpoint.outputOverwriteFields
      })
    }
    // ------------------
    endpoint = this.operations.get('deleteMany');
    if (endpoint) {
      // endpoint.defineParameter('metadata', {enum: MetadataMode, isBuiltin: true});
      endpoint.defineParameter('filter', {type: 'string', isBuiltin: true});
    }
    // ------------------
    endpoint = this.operations.get('get');
    if (endpoint) {
      // endpoint.defineParameter('metadata', {enum: MetadataMode, isBuiltin: true, default: 'minimal'});
      endpoint.defineParameter('pick', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('omit', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('include', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.response.type = this.type;
      (endpoint.response as any)._encoder = endpoint.response.type.generateCodec('encode', {
        partial: true,
        pick: endpoint.options.outputPickFields,
        omit: endpoint.options.outputOmitFields,
        operation: 'read',
        overwriteFields: endpoint.outputOverwriteFields
      })
    }
    // ------------------
    endpoint = this.operations.get('findMany');
    if (endpoint) {
      // endpoint.defineParameter('metadata', {enum: MetadataMode, isBuiltin: true, default: 'minimal'});
      endpoint.defineParameter('pick', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('omit', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('include', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('sort', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('filter', {type: 'string', isBuiltin: true});
      endpoint.defineParameter('limit', {type: 'integer', isBuiltin: true});
      endpoint.defineParameter('skip', {type: 'integer', isBuiltin: true});
      endpoint.defineParameter('distinct', {type: 'boolean', isBuiltin: true});
      endpoint.defineParameter('count', {type: 'boolean', isBuiltin: true});
      endpoint.response.type = this.type;
      (endpoint.response as any)._encoder = vg.isArray(endpoint.response.type.generateCodec('encode', {
        partial: true,
        pick: endpoint.options.outputPickFields,
        omit: endpoint.options.outputOmitFields,
        operation: 'read',
        overwriteFields: endpoint.outputOverwriteFields
      }))
    }
    // ------------------
    endpoint = this.operations.get('update');
    if (endpoint) {
      // endpoint.defineParameter('metadata', {enum: MetadataMode, isBuiltin: true, default: 'minimal'});
      endpoint.defineParameter('pick', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('omit', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('include', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.decodeInput = this.type.generateCodec('decode', {
        partial: true,
        pick: endpoint.options.inputPickFields,
        omit: endpoint.options.inputOmitFields,
        operation: 'write',
        overwriteFields: endpoint.inputOverwriteFields
      })
      endpoint.response.type = this.type;
      (endpoint.response as any)._encoder = endpoint.response.type.generateCodec('encode', {
        partial: true,
        pick: endpoint.options.outputPickFields,
        omit: endpoint.options.outputOmitFields,
        operation: 'read',
        overwriteFields: endpoint.outputOverwriteFields
      })
    }
    // ------------------
    endpoint = this.operations.get('updateMany');
    if (endpoint) {
      // endpoint.defineParameter('metadata', {enum: MetadataMode, isBuiltin: true, default: 'minimal'});
      endpoint.defineParameter('filter', {type: 'string', isBuiltin: true});
      endpoint.decodeInput = this.type.generateCodec('decode', {
        partial: true,
        pick: endpoint.options.inputPickFields,
        omit: endpoint.options.inputOmitFields,
        operation: 'write',
        overwriteFields: endpoint.inputOverwriteFields
      })
    }
  }

  exportSchema(options?: {
    webSafe?: boolean
  }): OpraSchema.Collection {
    return {
      ...super.exportSchema(options) as OpraSchema.Collection,
      type: this.type.name || 'object',
      ...{
        primaryKey: this.primaryKey
      }
    };
  }

  parseKeyValue(value: any): any {
    if (!this.primaryKey?.length)
      return;
    const dataType = this.type;
    if (this.primaryKey.length > 1) {
      // Build primary key/value mapped object
      const obj = Array.isArray(value)
          ? this.primaryKey.reduce((o, k, i) => {
            o[k] = value[i];
            return obj;
          }, {} as any)
          : value;
      // decode values
      for (const [k, v] of Object.entries(obj)) {
        const el = dataType.getField(k);
        if (el.type instanceof SimpleType) {
          try {
            obj[k] = el.type.decode(v, {coerce: true});
          } catch (e: any) {
            e.message = `The key value for field "${el.name}" is not valid. ` + e.message;
          }
        }
        if (obj[k] == null)
          throw new TypeError(`You must provide value of primary field(s) (${k})`);
      }
    } else {
      const primaryKey = this.primaryKey[0];
      if (typeof value === 'object')
        value = value[primaryKey];
      const el = dataType.getField(primaryKey);
      let result: any;
      if (value != null && el.type instanceof SimpleType) {
        try {
          result = el.type.decode(value, {coerce: true});
        } catch (e: any) {
          e.message = `The key value is not valid. ` + e.message;
        }
      }
      if (result == null)
        throw new TypeError(`You must provide value of primary field(s) (${primaryKey})`);
      return result;
    }
  }

  normalizeFieldNames(fields: string | string[], allowSortSigns?: boolean): string[] | undefined {
    return this.type.normalizeFieldNames(fields as any, allowSortSigns);
  }

  normalizeSortFields(fields: string | string[]): string[] | undefined {
    const normalized = this.type.normalizeFieldNames(fields, true);
    if (!normalized)
      return;
    const findManyOp = this.getOperation('findMany');
    const sortFields = findManyOp && findManyOp.options.sortFields;
    (Array.isArray(normalized) ? normalized : [normalized]).forEach(field => {
      const m = SORT_FIELD_PATTERN.exec(field);
      if (m && !sortFields?.find(x => x === m[2]))
        throw new BadRequestError({
          message: translate('error:UNACCEPTED_SORT_FIELD', {field}),
        })
    });
    return normalized;
  }

  normalizeFilter(filter: string | OpraFilter.Expression): OpraFilter.Expression | undefined {
    if (!filter)
      return;
    const ast = typeof filter === 'string' ? OpraFilter.parse(filter) : filter;
    if (ast instanceof OpraFilter.ComparisonExpression) {
      this.normalizeFilter(ast.left);
      if (!(ast.left instanceof OpraFilter.QualifiedIdentifier && ast.left.field))
        throw new TypeError(`Invalid filter query. Left side should be a data field.`);
      // Check if filtering accepted for given field
      const findManyOp = this.getOperation('findMany');
      const fieldLower = ast.left.value.toLowerCase();
      const filterDef = (findManyOp && findManyOp.options.filters || [])
          .find(f => f.field.toLowerCase() === fieldLower);
      if (!filterDef) {
        throw new BadRequestError({
          message: translate('error:UNACCEPTED_FILTER_FIELD', {field: ast.left.value}),
        })
      }
      // Check if filtering endpoint accepted for given field
      if (filterDef.operators && !filterDef.operators.includes(ast.op))
        throw new BadRequestError({
          message: translate('error:UNACCEPTED_FILTER_OPERATION', {field: ast.left.value}),
        })
      this.normalizeFilter(ast.right);
      return ast;
    }
    if (ast instanceof OpraFilter.LogicalExpression) {
      ast.items.forEach(item =>
          this.normalizeFilter(item));
      return ast;
    }
    if (ast instanceof OpraFilter.ArithmeticExpression) {
      ast.items.forEach(item =>
          this.normalizeFilter(item.expression));
      return ast;
    }
    if (ast instanceof OpraFilter.ArrayExpression) {
      ast.items.forEach(item =>
          this.normalizeFilter(item));
      return ast;
    }
    if (ast instanceof OpraFilter.ParenthesizedExpression) {
      this.normalizeFilter(ast.expression);
      return ast;
    }
    if (ast instanceof OpraFilter.QualifiedIdentifier) {
      const normalizedFieldPath = this.type.normalizeFieldNames(ast.value)?.join('.') as string;
      ast.field = this.type.getField(normalizedFieldPath);
      ast.dataType = ast.field?.type || this.document.getDataType('any');
      ast.value = normalizedFieldPath;
      return ast;
    }
    return ast;
  }

}
