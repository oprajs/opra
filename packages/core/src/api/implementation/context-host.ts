import {Type} from 'ts-gems';
import {Expression, OpraURL} from '@opra/url';
import {OpraContext, QueryNode} from '../interfaces/context.interface.js';
import {ProviderResolver} from '../interfaces/provider-resolver.js';

interface OpraContextInit {
  schemaType: Type;
  userContext?: any;
  thisValue?: any;
  currentPath?: string[];
  queryNode: QueryNode;
}

export abstract class OpraContextHost implements OpraContext {
  protected readonly schemaType: Type;
  protected readonly userContext?: any;
  protected readonly currentPath?: string[];
  protected readonly queryNode: QueryNode;
  protected thisValue?: any;

  protected constructor(init: OpraContextInit) {
    this.schemaType = init.schemaType;
    this.userContext = init.userContext;
    this.thisValue = init.thisValue;
    this.currentPath = init.currentPath;
    this.queryNode = init.queryNode;
  }

  getSchemaType<T = any>(): Type<T> {
    return this.schemaType;
  }

  getCurrentPath(): string[] | undefined {
    return this.currentPath;
  }

  getQuery(): QueryNode {
    return this.queryNode;
  }

  getThisValue(): object | undefined {
    return this.thisValue;
  }

  setThisValue(v: object) {
    this.thisValue = v;
  }

  getUserContext<T = any>(): T {
    return this.userContext;
  }

}

export class QueryNodeHost implements QueryNode {
  parent?: QueryNode;
  type: Type;
  isArray: boolean;
  name: string;
  keyValue: string | Record<string, any> | undefined;
  properties?: Record<string, boolean | QueryNode>;
  filter?: Expression;
  limit?: number;
  skip?: number;
  distinct?: boolean;
  total?: boolean;

  static fromURL(providerResolver: ProviderResolver, url: OpraURL): QueryNode {
    return {} as any;

    /*
    providerResolver.getEntityProviderInstance()

    let curSchema = SchemaMetadata.getMetadata(entity);
    if (!curSchema)
      throw new TypeError(`"${entity}" is not a valid DTO schema`);


    // let curIsCollection = false;
    let nextTypeInfo;
    let curType = entity;

    const rootNode = new QueryNodeHost();
    rootNode.type = entity;
    rootNode.name = curSchema.name;

    let curNode = rootNode;

    let keyProperties: string[] | undefined;
    for (const [curP, i] of url.path.entries()) {

      if (i === 0 && curP.resource !== curSchema.name)
        throw new TypeError(`Implementation error. ${curP.resource} != ${curSchema.name}`);

      if (curP.key) {
        keyProperties = getSchemaKeyProperties(curType);
        if (!keyProperties)
          throw new TypeError(`Unable to query "${curSchema.name}" by key. No key property defined.`);
        curNode.keyValue = curP.key;
      } else keyProperties = undefined;


      if (i > 0) {
        curTypeInfo = getTypeInfo(curType, curP.resource);
      }

      const nextP = url.path.get(i + 1);
      // Determine type info of next path item
      if (nextP) {
        // Can not query sub properties of a collection query
        if (curIsCollection)
          throw new Error('Invalid request'); // todo: switch to structured error class
        nextTypeInfo = getTypeInfo(curType, nextP.resource);
      } else nextTypeInfo = undefined;
    }
    return rootNode;*/
  }

}
