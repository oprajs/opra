import * as vg from 'valgen';
import { BadRequestError } from '../../exception/index.js';
import { OpraFilter } from '../../filter/index.js';
import { omitUndefined } from '../../helpers/object-utils.js';
import { translate } from '../../i18n/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { ComplexType } from '../data-type/complex-type.js';
import { SimpleType } from '../data-type/simple-type.js';
import { generateCodec, GenerateDecoderOptions } from '../utils/generate-codec.js';
import type { Collection } from './collection.js';
import { Resource } from './resource.js';

export class CollectionClass extends Resource {
  private _decoders: Record<string, vg.Validator<any>> = {};
  private _encoders: Record<string, vg.Validator<any>> = {};
  readonly type: ComplexType;
  readonly kind = OpraSchema.Collection.Kind;
  readonly operations: OpraSchema.Collection.Operations;
  readonly controller?: object;
  readonly primaryKey: string[];

  constructor(
      document: ApiDocument,
      init: Collection.InitArguments
  ) {
    super(document, init);
    this.controller = init.controller;
    this.operations = {...init.operations};
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
  }

  exportSchema(): OpraSchema.Collection {
    return {
      ...super.exportSchema() as OpraSchema.Collection,
      ...omitUndefined({
        type: this.type.name || 'object',
        operations: this.operations,
        primaryKey: this.primaryKey
      })
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
        if (el.type instanceof SimpleType)
          obj[k] = el.type.decode(v);
        if (obj[k] == null)
          throw new TypeError(`You must provide value of primary field(s) (${k})`);
      }
    } else {
      const primaryKey = this.primaryKey[0];
      if (typeof value === 'object')
        value = value[primaryKey];
      const el = dataType.getField(primaryKey);
      let result: any;
      if (el.type instanceof SimpleType)
        result = el.type.decode(value);
      if (result == null)
        throw new TypeError(`You must provide value of primary field(s) (${primaryKey})`);
      return result;
    }
  }

  normalizeFieldPath(path: string | string[]): string[] | undefined {
    return this.type.normalizeFieldPath(path as any);
  }

  normalizeSortFields(this: Collection, fields: string | string[]): string[] | undefined {
    const normalized = this.type.normalizeFieldPath(fields);
    if (!normalized)
      return;
    const findManyOp = this.operations.findMany;
    const sortFields = findManyOp && findManyOp.sortFields;
    (Array.isArray(normalized) ? normalized : [normalized]).forEach(field => {
      if (!sortFields?.find(x => x === field))
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
      const findManyOp = this.operations.findMany;
      const fieldLower = ast.left.value.toLowerCase();
      const filterDef = (findManyOp && findManyOp.filters || [])
          .find(f => f.field.toLowerCase() === fieldLower);
      if (!filterDef) {
        throw new BadRequestError({
          message: translate('error:UNACCEPTED_FILTER_FIELD', {field: ast.left.value}),
        })
      }
      // Check if filtering endpoint accepted for given field
      if (!filterDef.operators?.includes(ast.op))
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
      const normalizedFieldPath = this.type.normalizeFieldPath(ast.value)?.join('.') as string;
      ast.field = this.type.getField(normalizedFieldPath);
      ast.dataType = ast.field?.type || this.document.getDataType('any');
      ast.value = normalizedFieldPath;
      return ast;
    }
    return ast;
  }

  getDecoder(endpoint: keyof OpraSchema.Collection.Operations): vg.Validator<any, any> {
    let decoder = this._decoders[endpoint];
    if (decoder)
      return decoder;
    const options: GenerateDecoderOptions = {
      partial: endpoint !== 'create'
    };
    if (endpoint !== 'create')
      options.omit = [...this.primaryKey];
    decoder = generateCodec(this.type, 'decode', options);
    this._decoders[endpoint] = decoder;
    return decoder;
  }

  getEncoder(endpoint: keyof OpraSchema.Collection.Operations): vg.Validator<any, any> {
    let encoder = this._encoders[endpoint];
    if (encoder)
      return encoder;
    const options: GenerateDecoderOptions = {
      partial: true
    };
    encoder = generateCodec(this.type, 'encode', options);
    if (endpoint === 'findMany')
      return vg.isArray(encoder);
    this._encoders[endpoint] = encoder;
    return encoder;
  }

}
