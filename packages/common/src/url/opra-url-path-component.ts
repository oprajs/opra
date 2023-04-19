import { encodePathComponent } from './utils/encode-path-component.js';

const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');

export type OpraURLPathComponentInit = { resource: string; key?: any, typeCast?: string };

export class OpraURLPathComponent {
  public resource: string;
  public key?: any;
  public typeCast?: string

  constructor(init: OpraURLPathComponentInit) {
    this.resource = init.resource;
    this.key = init.key;
    this.typeCast = init.typeCast;
  }

  toString() {
    const obj = encodePathComponent(this.resource, this.key, this.typeCast);
    if (obj)
      Object.setPrototypeOf(obj, OpraURLPathComponent.prototype);
    return obj;
  }

  /* istanbul ignore next */
  [nodeInspectCustom]() {
    const out: any = {
      resource: this.resource,
    };
    if (this.key != null)
      out.key = this.key;
    if (this.typeCast != null)
      out.typeCast = this.typeCast;
    return out;
  }
}
