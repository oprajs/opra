import { Class, PartialSome, Type } from 'ts-gems';
import type { DataType } from './data-type.js';
import { createMappedClass } from './utils/create-mapped-class.js';

/**
 * Create a new MappedType that marks given or all fields as optional
 * @param baseType
 * @param keys
 * @param options
 */
export function PartialType(baseType: string | Type, keys: string[], options?: DataType.Options): Type;
/**
 * Create a new MappedType that marks given or all fields as optional
 * @param baseType
 * @param options
 */
export function PartialType(baseType: string | Type, options?: DataType.Options): Type;
/**
 * Create a new MappedType that marks given fields as optional
 * @param baseType
 * @param keys
 * @param options
 */
export function PartialType<Args extends any[], Instance, Static, K extends keyof Instance>(
  baseType: Class<Args, Instance, Static>,
  keys: readonly K[],
  options?: DataType.Options,
): Class<Args, PartialSome<Instance, K>> & Omit<Pick<Static, keyof typeof baseType>, 'prototype' | 'constructor'>;
/**
 * Create a new MappedType that marks all fields as optional
 * @param baseType
 * @param options
 */
export function PartialType<Args extends any[], Instance, Static>(
  baseType: Class<Args, Instance, Static>,
  options?: DataType.Options,
): Class<Args, Partial<Instance>> & Omit<Pick<Static, keyof typeof baseType>, 'prototype' | 'constructor'>;
/**
 *
 */
export function PartialType(base: any, ...args: any[]) {
  const keys = Array.isArray(args[0]) ? args[0] : true;
  const options = Array.isArray(args[0]) ? args[1] : args[0];
  return createMappedClass(base, { partial: keys }, options) as any;
}
