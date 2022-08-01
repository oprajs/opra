import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { CaseInsensitiveObject } from '../helpers/case-insensitive-object';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../helpers/terminal-utils';
import { OpraService } from '../interfaces/opra-service.interface';
import { DataType } from './data-type/data-type';
import { Resource } from './resource/resource';

export type OpraServiceHostArgs = StrictOmit<OpraSchema.Service, 'version' | 'types' | 'resources'>;

export class OpraServiceHost implements OpraService {
  protected readonly _args: OpraServiceHostArgs;
  readonly types: Record<string, DataType> = CaseInsensitiveObject({});
  readonly resources: Record<string, Resource> = CaseInsensitiveObject({});

  constructor(args: OpraServiceHostArgs) {
    this._args = args;
  }

  get name(): string {
    return this._args.info?.title || '';
  }

  getDataTypes(): DataType[] {
    return Array.from(Object.values(this.types));
  }

  getDataType(name: string): DataType {
    const t = this.types[name];
    if (!t)
      throw new Error(`Date type "${name}" not found`);
    return t;
  }

  getResources(): Resource[] {
    return Array.from(Object.values(this.resources));
  }

  getResource(name: string): Resource {
    const t = this.resources[name];
    if (!t)
      throw new Error(`Resource "${name}" not found`);
    return t;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
