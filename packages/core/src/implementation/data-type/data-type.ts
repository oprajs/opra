import { Type } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import type { OpraDocument } from '../opra-document.js';

export abstract class DataType {
  protected _owner: OpraDocument;
  protected readonly _args: any;
  readonly base?: DataType

  protected constructor(owner: OpraDocument, args: OpraSchema.DataType, base?: DataType) {
    this._args = {...args};
    this._owner = owner;
    if (base) {
      this.base = base;
      Object.setPrototypeOf(this._args, base._args);
    }
  }

  get owner(): OpraDocument {
    return this._owner;
  }

  get kind(): OpraSchema.DataTypeKind {
    return this._args.kind;
  }

  get name(): string {
    return this._args.name;
  }

  get description(): string | undefined {
    return this._args.description;
  }

  get abstract(): boolean {
    return !!this._args.abstract;
  }

  get ctor(): Type {
    return this._args.ctor;
  }

  is(typeName: string): boolean {
    return this.name === typeName || !!(this.base && this.base.is(typeName));
  }

  getMetadata(): any {
    return {
      kind: this.kind,
      base: this.base?.name,
      abstract: this.abstract ? true : undefined,
      name: this.name,
      description: this.description,
    }
  }

}
