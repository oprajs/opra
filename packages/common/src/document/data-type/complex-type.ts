import omit from 'lodash.omit';
import { StrictOmit, Type, Writable } from 'ts-gems';
import { ObjectTree, omitUndefined, pathToObjectTree, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY, TYPENAME_PATTERN } from '../constants.js';
import { DataType } from './data-type.js';
import { Element } from './element.js';
import type { Expose } from './expose.decorator';
import type { UnionType } from './union-type';

/**
 * @namespace ComplexType
 */
export namespace ComplexType {
  export interface InitArguments extends DataType.InitArguments,
      Pick<OpraSchema.ComplexType, 'ctor' | 'abstract' | 'additionalElements'> {
    base?: ComplexType | UnionType;
  }

  export interface OwnProperties extends DataType.OwnProperties,
      Readonly<Pick<OpraSchema.ComplexType, 'ctor' | 'abstract' | 'additionalElements'>> {
    readonly elements: ResponsiveMap<string, Element>;
  }

  export interface DecoratorOptions extends DataType.DecoratorOptions,
      Pick<InitArguments, 'ctor' | 'base' | 'additionalElements' | 'abstract'> {

  }

  export interface Metadata extends StrictOmit<OpraSchema.ComplexType, 'elements'> {
    name: string;
    elements?: Record<string, Expose.Metadata>;
  }
}

/**
 * Type definition of ComplexType prototype
 * @type ComplexType
 */
export interface ComplexType extends StrictOmit<DataType, 'own' | 'exportSchema'>,
    ComplexType.OwnProperties {
  readonly ctor: Type;
  readonly base?: ComplexType | UnionType;
  readonly own: ComplexType.OwnProperties;

  exportSchema(): OpraSchema.ComplexType;

  addElement(init: Element.InitArguments): Element;

  getElement(name: string): Element;

  normalizeElementNames(elements: string[]): string[] | undefined;
}

/**
 * Type definition of ComplexType constructor type
 * @type ComplexTypeConstructor
 */
export interface ComplexTypeConstructor {
  new(document: ApiDocument, init: ComplexType.InitArguments): ComplexType;

  (options?: ComplexType.DecoratorOptions): ClassDecorator;

  prototype: ComplexType;
}

/**
 * @class ComplexType
 */
export const ComplexType = function (
    this: ComplexType | void, ...args: any[]
) {
  // ClassDecorator
  if (!this) {
    const [options] = args as [ComplexType.InitArguments | undefined];
    return function (target: Function) {
      const name = options?.name || target.name.match(TYPENAME_PATTERN)?.[1] || target.name;
      let metadata = Reflect.getOwnMetadata(METADATA_KEY, target) as ComplexType.Metadata;
      if (!metadata) {
        metadata = {} as ComplexType.Metadata;
        Reflect.defineMetadata(METADATA_KEY, metadata, target);
      }
      metadata.kind = OpraSchema.ComplexType.Kind;
      metadata.name = name;
      // Merge options
      if (options)
        Object.assign(metadata, omit(options, ['kind', 'name', 'base', 'ctor', 'elements']));
    }
  }

  // Constructor
  // call super()
  DataType.apply(this, args);

  const [, init] = args as [never, ComplexType.InitArguments | undefined];
  const _this = this as Writable<ComplexType>;
  const own = _this.own as Writable<ComplexType.OwnProperties>
  own.ctor = init?.ctor;
  own.elements = new ResponsiveMap();
  own.abstract = init?.abstract;
  own.additionalElements = init?.additionalElements;

  _this.kind = OpraSchema.ComplexType.Kind;
  _this.base = init?.base;
  _this.ctor = own.ctor || Object;
  _this.abstract = own.abstract;
  _this.additionalElements = own.additionalElements;
  _this.elements = new ResponsiveMap();
  if (_this.base) {
    if (_this.additionalElements == null)
      _this.additionalElements = _this.base.additionalElements;
    if (own.ctor == null && _this.base instanceof ComplexType)
      _this.ctor = _this.base.ctor;
    if (_this.base.elements)
      for (const [k, el] of _this.base.elements.entries()) {
        const newEl = new Element(_this, el);
        _this.elements.set(k, newEl);
      }
  }

} as ComplexTypeConstructor;

Object.setPrototypeOf(ComplexType.prototype, DataType.prototype);

const proto = {

  extendsFrom(t: string | Type | DataType): boolean {
    const base = t instanceof DataType ? t : this.document.getDataType(t);
    if (this.base) {
      if (this.base === base)
        return true;
      return this.base.extendsFrom(base);
    }
    return false;
  },

  exportSchema(): OpraSchema.ComplexType {
    const out = DataType.prototype.exportSchema.call(this) as OpraSchema.ComplexType;
    Object.assign(out, omitUndefined({
      base: this.base ?
          (this.base.name ? this.base.name : this.base.exportSchema()) : undefined,
      abstract: this.own.abstract,
      additionalElements: this.own.additionalElements
    }));
    if (this.own.elements.size) {
      const elements = out.elements = {};
      for (const element of this.own.elements.values()) {
        elements[element.name] = element.exportSchema();
      }
    }
    return omitUndefined(out);
  },

  addElement(init: Element.InitArguments): Element {
    const element = new Element(this, init);
    this.own.elements.set(element.name, element);
    this.elements.set(element.name, element);
    return element;
  },

  getElement(name: string): Element {
    if (name.includes('.')) {
      let dt: DataType = this;
      const arr = name.split('.');
      const l = arr.length;
      let element: Element;
      for (let i = 0; i < l; i++) {
        if (!(dt instanceof ComplexType))
          throw new TypeError(`Element "${arr.slice(0, i - 1)}" is not a ${OpraSchema.ComplexType.Kind} and has no child elements`);
        element = dt.getElement(arr[i]);
        dt = element.type;
      }
      // @ts-ignore
      return element;
    }
    const t = this.elements.get(name);
    if (!t)
      throw new Error(`"${this.name}" type doesn't have an element named "${name}"`);
    return t;
  },

  normalizeElementNames(this: ComplexType, elements: string[]): string[] | undefined {
    const fieldsTree = pathToObjectTree(elements) || {};
    const out = _normalizeElementNames([], this.document, this, fieldsTree, '', '');
    return out.length ? out : undefined;
  }

} as ComplexType;

Object.assign(ComplexType.prototype, proto);
Object.setPrototypeOf(ComplexType.prototype, DataType.prototype);

/**
 * Normalizes element names
 */
function _normalizeElementNames(
    target: string[],
    document: ApiDocument,
    dataType: ComplexType | undefined,
    node: ObjectTree,
    parentPath: string = '',
    actualPath: string = ''
): string[] {
  let curPath = '';
  for (const k of Object.keys(node)) {
    const nodeVal = node[k];

    const element = dataType?.elements.get(k);
    if (!element) {
      curPath = parentPath ? parentPath + '.' + k : k;

      if ((dataType && !dataType.additionalElements))
        throw new TypeError(`Unknown element "${curPath}"`);
      if (typeof nodeVal === 'object')
        _normalizeElementNames(target, document, undefined, nodeVal, curPath, actualPath);
      else target.push(curPath);
      continue;
    }
    curPath = parentPath ? parentPath + '.' + element.name : element.name;

    if (typeof nodeVal === 'object') {
      if (!(element.type instanceof ComplexType))
        throw new TypeError(`"${(actualPath ? actualPath + '.' + curPath : curPath)}" is not a complex type and has no sub fields`);
      if (target.findIndex(x => x === parentPath) >= 0)
        continue;

      target = _normalizeElementNames(target, document, element.type, nodeVal, curPath, actualPath);
      continue;
    }

    if (target.findIndex(x => x.startsWith(curPath + '.')) >= 0) {
      target = target.filter(x => !x.startsWith(curPath + '.'));
    }

    target.push(curPath);
  }
  return target;
}
