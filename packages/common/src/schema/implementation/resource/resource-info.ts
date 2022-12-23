import { OpraSchema } from '../../opra-schema.definition.js';
import { cloneObject } from '../../utils/clone-object.util.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/inspect.util.js';
import type { OpraDocument } from '../opra-document.js';

export abstract class ResourceInfo {
  readonly metadata: OpraSchema.Resource;
  readonly document: OpraDocument;
  readonly name: string;
  protected path: string;

  protected constructor(document: OpraDocument, name: string, metadata: OpraSchema.Resource) {
    this.document = document;
    this.name = name;
    this.metadata = metadata;
  }

  get instance(): {} | undefined {
    return this.metadata.instance;
  }

  get kind(): OpraSchema.ResourceKind {
    return this.metadata.kind;
  }

  get description(): string | undefined {
    return this.metadata.description;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  validateQueryOptions(): any {
    //
  }

  getSchema(jsonOnly?: boolean): OpraSchema.Resource {
    return cloneObject(this.metadata, jsonOnly);
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
