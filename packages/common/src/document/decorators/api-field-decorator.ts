import { omitUndefined } from '@jsopen/objects';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { DATATYPE_METADATA } from '../constants.js';
import type { ApiField } from '../data-type/api-field.js';
import type { ComplexType } from '../data-type/complex-type.js';

export interface ApiFieldDecorator extends PropertyDecorator {
  /**
   * Overrides the default settings of an API field with specified options.
   *
   * @param {string | RegExp | (string | RegExp)[]} scopePattern - A pattern or array of patterns that defines the scope
   *        within which the override applies. Patterns can be strings or regular expressions.
   * @param {StrictOmit<ApiField.Options, 'isArray' | 'type' | 'scopePattern'>} options - Configuration options to override
   *        the default API field behavior, excluding the properties 'isArray', 'type', and 'scopePattern'.
   * @return {ApiFieldDecorator} The decorated API field after applying the override configuration.
   */
  Override(
    scopePattern: (string | RegExp) | (string | RegExp)[],
    options: StrictOmit<ApiField.Options, 'isArray' | 'type' | 'scopePattern'>,
  ): ApiFieldDecorator;
}

export interface ApiFieldDecoratorFactory {
  (options?: ApiField.Options): ApiFieldDecorator;
}

export function ApiFieldDecoratorFactory(
  options?: ApiField.Options,
): ApiFieldDecorator {
  const decoratorChain: Function[] = [];
  /**
   *
   */
  const decorator = function (target: Object, propertyKey: string | symbol) {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can't be used as a field`);

    const metadata: ComplexType.Metadata =
      Reflect.getOwnMetadata(DATATYPE_METADATA, target.constructor) ||
      ({} as any);
    metadata.kind = OpraSchema.ComplexType.Kind;
    metadata.fields = metadata.fields || {};

    const designType = Reflect.getMetadata('design:type', target, propertyKey);
    const elemMeta: ApiField.Metadata = (metadata.fields[propertyKey] = {
      ...options,
    });
    if (designType === Array) {
      elemMeta.isArray = true;
    } else elemMeta.type = elemMeta.type || designType;
    Reflect.defineMetadata(DATATYPE_METADATA, metadata, target.constructor);
    for (const fn of decoratorChain) fn(elemMeta);
  } as ApiFieldDecorator;

  /**
   *
   */
  decorator.Override = (
    scopes: (string | RegExp) | (string | RegExp)[],
    opts: StrictOmit<ApiField.Options, 'isArray' | 'type' | 'scopePattern'>,
  ): any => {
    decoratorChain.push((meta: ApiField.Metadata): void => {
      meta.override = meta.override || [];
      meta.override.push(
        omitUndefined({
          ...opts,
          scopePattern: Array.isArray(scopes) ? scopes : [scopes],
          type: undefined,
          isArray: undefined,
        }),
      );
    });
    return decorator;
  };

  return decorator;
}
