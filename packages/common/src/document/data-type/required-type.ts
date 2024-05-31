import { Class, RequiredSome, Type } from 'ts-gems';
import type { DataType } from './data-type.js';
import { createMappedClass } from './utils/create-mapped-class.js';

/**
 * Create a new MappedType that marks given or all fields as required
 * @param baseType
 * @param keys
 * @param options
 */
export function RequiredType(baseType: string | Type, keys?: string[] | true, options?: DataType.Options): Type;
/**
 * Create a new MappedType that marks given fields as baseType
 * @param baseType
 * @param keys
 * @param options
 */
export function RequiredType<Args extends any[], Instance, Static, K extends keyof Instance>(
  baseType: Class<Args, Instance, Static>,
  keys?: readonly K[],
  options?: DataType.Options,
): Class<Args, RequiredSome<Instance, K>> & Omit<Pick<Static, keyof typeof baseType>, 'prototype' | 'constructor'>;
/**
 * Create a new MappedType that marks all fields as baseType
 * @param baseType
 * @param options
 */
export function RequiredType<Args extends any[], Instance, Static>(
  baseType: Class<Args, Instance, Static>,
  options?: DataType.Options,
): Class<Args, Required<Instance>> & Omit<Pick<Static, keyof typeof baseType>, 'prototype' | 'constructor'>;
/**
 *
 */
export function RequiredType(base: any, ...args: any[]) {
  const keys = Array.isArray(args[0]) ? args[0] : true;
  const options = Array.isArray(args[0]) ? args[1] : args[0];
  return createMappedClass(base, { required: keys }, options) as any;
}
