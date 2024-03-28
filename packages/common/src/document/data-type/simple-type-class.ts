import { isAny, Validator } from 'valgen';
import validator from 'validator';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiNode } from '../api-node';
import { DECODER, ENCODER } from '../constants';
import type { ComplexType } from './complex-type';
import { DataType } from './data-type.js';
import type { SimpleType } from './simple-type.js';

/**
 * @class SimpleType
 */
export class SimpleTypeClass extends DataType {
  readonly kind = OpraSchema.SimpleType.Kind
  readonly base?: SimpleType;
  readonly instance: object;
  readonly own: SimpleType.OwnProperties;
  attributes?: Record<string, SimpleType.Attribute>;

  constructor(node: ApiNode, init: SimpleType.InitArguments) {
    super(node, init);
    this.own.attributes = init.attributes;
    this.own.instance = init.instance;
    this.attributes = {
      ...this.base?.attributes,
      ...init?.attributes
    };
    this.instance = init.instance || this.base?.instance || {};
  }

  toJSON(): OpraSchema.SimpleType {
    // noinspection UnnecessaryLocalVariableJS
    const out = super.toJSON() as OpraSchema.SimpleType;
    const attributes = omitUndefined<any>(this.own.attributes);
    return omitUndefined<OpraSchema.SimpleType>({
      ...out,
      attributes: Object.keys(attributes).length ? attributes : undefined
    })
  }

  generateCodec(codec: 'decode' | 'encode'): Validator {
    if (codec === 'encode') {
      const fn = this.instance?.[ENCODER];
      return fn ? fn.apply(this.instance) : isAny;
    }
    const fn = this.instance?.[DECODER];
    return fn ? fn.apply(this.instance) : isAny;
  }

}
