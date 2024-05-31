import { Class, Type } from 'ts-gems';
import type { DataType } from './data-type.js';
import { createMappedClass } from './utils/create-mapped-class.js';

/**
 * Create a new MappedType that picks given fields from base type
 * @param baseType
 * @param keys
 * @param options
 */
export function PickType(baseType: string | Type, keys: string[], options?: DataType.Options): Type;
/**
 * Create a new MappedType that picks given fields from base type
 * @param baseType
 * @param keys
 * @param options
 */
export function PickType<Args extends any[], Instance, Static, K extends keyof Instance>(
  baseType: Class<Args, Instance, Static>,
  keys: readonly K[],
  options?: DataType.Options,
): Class<Args, Pick<Instance, K>> & Omit<Pick<Static, keyof typeof baseType>, 'prototype' | 'constructor'>;
/**
 *
 */
export function PickType(baseType: any, keys: any, options?: DataType.Options) {
  return createMappedClass(baseType, { pick: keys }, options) as any;
}
