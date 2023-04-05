import { Writable } from 'ts-gems';
import {
  ComplexType, Element,
  normalizeElementNames,
} from '@opra/common';
import { EntityQuery } from './entity-query.js';

export namespace ElementGetQuery {
  export type Options = {
    pick?: string[];
    omit?: string[];
    include?: string[];
    castingType?: ComplexType;
  };
}

export class ElementGetQuery extends EntityQuery {
  readonly subject = 'Element';
  readonly method = 'get'
  readonly operation = 'read';
  readonly elementName: string;
  readonly element?: Element;
  readonly path: string;
  readonly parentType: ComplexType;
  pick?: string[];
  omit?: string[];
  include?: string[];

  constructor(
      readonly parent: EntityQuery,
      elementName: string,
      options?: ElementGetQuery.Options
  ) {
    super(parent.resource);
    const _this: Writable<ElementGetQuery> = this;
    const parentType = options?.castingType || parent.type;
    if (!parentType || !(parentType instanceof ComplexType))
      throw new TypeError(`Data type of parent query is not a ComplexType`);
    this.parentType = parentType;
    this.element = parentType.additionalElements
        ? parentType.elements.get(elementName)
        : parentType.getElement(elementName);
    this.elementName = this.element ? this.element.name : elementName;
    _this.type = (this.element && this.element.type) || this.resource.document.getDataType('any');
    this.path = (parent instanceof ElementGetQuery
        ? parent.path + '.' : '') + this.elementName;
    if (this.type instanceof ComplexType) {
      if (options?.pick)
        this.pick = normalizeElementNames(this.resource.document, this.type, options.pick, this.path);
      if (options?.omit)
        this.omit = normalizeElementNames(this.resource.document, this.type, options.omit, this.path);
      if (options?.include)
        this.include = normalizeElementNames(this.resource.document, this.type, options.include, this.path);
    }
  }

}
