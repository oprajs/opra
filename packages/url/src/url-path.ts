import {EventEmitter} from 'events';
import {nodeInspectCustom, ResourceKey} from './types';
import {encodePathComponent} from './utils/url-utils';

export class OwoURLPath extends EventEmitter {
  private _entries: OwoURLPathComponent[] = [];

  constructor() {
    super();
  }

  get length(): number {
    return this._entries.length;
  }

  add(component: OwoURLPathComponent | { resource: string; key?: ResourceKey }): void
  add(name: string, key?: ResourceKey): void
  add(component: any, key?: ResourceKey): void {
    if (component instanceof OwoURLPathComponent) {
      this._entries.push(component);
    } else if (typeof component === 'object')
      this._entries.push(new OwoURLPathComponent(component.resource, component.key));
    else
      this._entries.push(new OwoURLPathComponent(component, key));
    this.emit('change');
  }

  clear(): void {
    this._entries = [];
    this.emit('change');
  }

  get(index: number): OwoURLPathComponent {
    return this._entries[index];
  }

  entries(): IterableIterator<[string, ResourceKey]> {
    const items: [string, ResourceKey | undefined][] = [];
    this.forEach((name: string, key: ResourceKey) => {
      items.push([name, key]);
    });
    return items.values();
  }

  forEach(callback: (name: string, key: ResourceKey, _this: this) => void) {
    for (const item of this._entries) {
      callback.call(this, item.resource, item.key, this);
    }
  }

  getResource(index: number): string | undefined {
    const v = this._entries[index];
    return v == null ? undefined : v.resource;
  }

  getKey(index: number): ResourceKey {
    const v = this._entries[index];
    return v == null ? undefined : v.key;
  }

  toString(): string {
    return this._entries.map(x => '' + x).join('/');
  }

  [Symbol.iterator](): IterableIterator<[string, any]> {
    return this.entries();
  }

  /* istanbul ignore next */
  [nodeInspectCustom]() {
    return this._entries;
  }

}

export class OwoURLPathComponent {
  constructor(public resource: string, public key?: ResourceKey) {
  }

  toString() {
    const obj = encodePathComponent(this.resource, this.key);
    if (obj)
      Object.setPrototypeOf(obj, OwoURLPathComponent.prototype);
    return obj;
  }

  /* istanbul ignore next */
  [nodeInspectCustom]() {
    const out: any = {
      resource: this.resource,
    };
    if (this.key != null)
      out.key = this.key;
    return out;
  }
}
