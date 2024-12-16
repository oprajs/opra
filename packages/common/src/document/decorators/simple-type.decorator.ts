import { OpraSchema } from '../../schema/index.js';
import { CLASS_NAME_PATTERN, DATATYPE_METADATA } from '../constants.js';
import type { SimpleType } from '../data-type/simple-type';

export interface SimpleTypeDecorator extends ClassDecorator {
  Example(value: any, description?: string): SimpleTypeDecorator;
}

export interface SimpleTypeDecoratorFactory {
  /**
   * Class decorator method for SimpleType
   * @param options
   */
  (options?: SimpleType.Options): SimpleTypeDecorator;
}

export function SimpleTypeDecoratorFactory(
  options?: SimpleType.Options,
): SimpleTypeDecorator {
  const decoratorChain: Function[] = [];
  /**
   *
   */
  const decorator = function (target: Function) {
    let name: string | undefined;
    if (!options?.embedded) {
      if (options?.name) {
        if (!CLASS_NAME_PATTERN.test(options.name))
          throw new TypeError(`"${options.name}" is not a valid type name`);
        name = options.name;
      } else {
        name = target.name;
        name = name.toLowerCase();
      }
    }
    const metadata: SimpleType.Metadata =
      Reflect.getOwnMetadata(DATATYPE_METADATA, target) || ({} as any);
    if (options) Object.assign(metadata, options);
    metadata.kind = OpraSchema.SimpleType.Kind;
    metadata.name = name;
    Reflect.defineMetadata(DATATYPE_METADATA, metadata, target);
  } as SimpleTypeDecorator;

  decorator.Example = (
    value: any,
    description?: string,
  ): SimpleTypeDecorator => {
    decoratorChain.push((meta: SimpleType.Metadata) => {
      meta.examples = meta.examples || [];
      meta.examples.push({
        description,
        value,
      });
    });
    return decorator;
  };

  return decorator;
}

export interface AttributeDecorator extends PropertyDecorator {
  Example(options?: Partial<OpraSchema.Attribute>): SimpleTypeDecorator;
}

export interface AttributeDecoratorFactory {
  (options?: Partial<OpraSchema.Attribute>): PropertyDecorator;
}

export function AttributeDecoratorFactory(
  options?: Partial<OpraSchema.Attribute>,
): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(
        `Symbol properties can't be decorated with Attribute`,
      );
    const metadata: SimpleType.Metadata =
      Reflect.getOwnMetadata(DATATYPE_METADATA, target.constructor) ||
      ({} as any);
    const designType = Reflect.getMetadata('design:type', target, propertyKey);
    let format = 'string' as any;
    if (designType === Boolean) format = 'boolean';
    else if (designType === Number) format = 'number';
    metadata.kind = OpraSchema.SimpleType.Kind;
    metadata.attributes = metadata.attributes || {};
    metadata.attributes[propertyKey] = {
      format: options?.format || format,
      description: options?.description,
      deprecated: options?.deprecated,
    };
    Reflect.defineMetadata(DATATYPE_METADATA, metadata, target.constructor);
  };
}
