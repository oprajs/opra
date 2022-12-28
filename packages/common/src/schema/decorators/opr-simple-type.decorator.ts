import { omit } from 'lodash';
import { StrictOmit } from 'ts-gems';
import { DATATYPE_METADATA } from '../constants.js';
import { SimpleTypeMetadata } from '../interfaces/data-type.metadata.js';

export type SimpleTypeDecoratorOptions = Partial<StrictOmit<SimpleTypeMetadata, 'name' | 'kind'>> & {
  name?: string;
};

const NAME_PATTERN = /^(.*)Type$/;

export function OprSimpleType(options?: SimpleTypeDecoratorOptions): ClassDecorator {
  return (target: Function): void => {
    const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
    const meta: SimpleTypeMetadata = {
      kind: 'SimpleType',
      name
    };
    Object.assign(meta, omit(options, Object.keys(meta)));
    Reflect.defineMetadata(DATATYPE_METADATA, meta, target);
  };
}
