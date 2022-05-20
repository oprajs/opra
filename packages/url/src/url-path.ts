import {EventEmitter} from 'events';
import {nodeInspectCustom, ResourceKey} from './types';
import {encodePathComponent} from './utils/path-utils';

export class OwoURLPath extends EventEmitter {
  private _entries: OwoUrlPathComponent[] = [];

  constructor() {
    super();
  }

  get length(): number {
    return this._entries.length;
  }

  add(name: string, key?: ResourceKey): void {
    this._entries.push(new OwoUrlPathComponent(name, key));
    this.emit('change');
  }

  clear(): void {
    this._entries = [];
    this.emit('change');
  }

  get(index: number): OwoUrlPathComponent {
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
    return this._entries.map(
      ({resource, key}) => encodePathComponent(resource, key)
    ).join('/');
  }

  [Symbol.iterator](): IterableIterator<[string, any]> {
    return this.entries();
  }

  [nodeInspectCustom]() {
    return this.toString();
  }

}

export class OwoUrlPathComponent {
  constructor(public resource, public key?: ResourceKey) {
  }

  toString() {
    encodePathComponent(this.resource, this.key);
  }

  [nodeInspectCustom]() {
    return this.toString();
  }
}

