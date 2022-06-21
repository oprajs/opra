import {EntityProvider, PartialOutput, OpraContext, ResourceList} from '../../../src/index.js';

export interface JsonCrudServiceArgs {
  data: any[];
  keyProperty: string | string[];
  propertyNames?: string[];
}

export abstract class JsonEntityProvider<TResource = any> extends EntityProvider<TResource> {
  abstract data: any[];
  abstract keyProperty: string | string[];
  propertyNames?: string[];
/*
  protected constructor(args: JsonCrudServiceArgs) {
    super();
    if (!propertyNames) {
      const names: string[] = propertyNames = [];
      for (const x of data) {
        Object.keys(x).forEach(s => {
          if (!names.includes(s))
            names.push(s);
        });
      }
    }
    this.propertyNames = propertyNames;
  }*/

  async processSearchRequest(context: OpraContext): Promise<ResourceList<PartialOutput<any>>> {
    const q = context.getQuery();
    // q.resourceName
    return {items: []};
  }

}
