import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';

export namespace Element {
  export interface InitArguments extends StrictOmit<OpraSchema.ComplexType.Element, 'type'> {
    name: string;
    type: DataType;
    origin?: ComplexType;
  }
}

export interface Element extends StrictOmit<OpraSchema.ComplexType.Element, 'type'> {
}

export class Element {
  owner: ComplexType;
  origin?: ComplexType;
  type: DataType;
  name: string;

  constructor(owner: ComplexType, init: Element.InitArguments) {
    this.owner = owner;
    this.name = init.name;
    this.origin = init.origin || owner;
    this.type = init.type;
    if (init?.description)
      this.description = init?.description;
    if (init?.isArray != null)
      this.isArray = init?.isArray;
    this.default = init?.default;
    this.fixed = init?.fixed;
    if (init?.deprecated != null)
      this.deprecated = init?.deprecated;
    if (init?.exclusive != null)
      this.exclusive = init?.exclusive;
    if (init?.required != null)
      this.required = init?.required;
  }

  exportSchema(): OpraSchema.ComplexType.Element {
    const out: OpraSchema.ComplexType.Element = {
      type: this.type.name ? this.type.name : this.type.exportSchema(),
      description: this.description,
      isArray: this.isArray,
      default: this.default,
      fixed: this.fixed
    };
    return out;
  }
}
