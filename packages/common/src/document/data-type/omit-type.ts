import { Class, Type } from 'ts-gems';
import type { DataType } from './data-type.js';
import { createMappedClass } from './utils/create-mapped-class.js';

/**
 * Create a new MappedType that omits given fields from base type
 * @param baseType
 * @param keys
 * @param options
 */
export function OmitType(baseType: string | Type, keys: string[], options?: DataType.Options): Type;
/**
 * Create a new MappedType that omits given fields from base type
 * @param baseType
 * @param keys
 * @param options
 */ export function OmitType<Args extends any[], Instance, Static, K extends keyof Instance>(
  baseType: Class<Args, Instance, Static>,
  keys: readonly K[],
  options?: DataType.Options,
): Class<Args, Omit<Instance, K>> & Omit<Pick<Static, keyof typeof baseType>, 'prototype' | 'constructor'>;
/**
 *
 */
export function OmitType(baseType: any, keys: any, options?: DataType.Options) {
  return createMappedClass(baseType, { omit: keys }, options) as any;
}
