import _ from 'lodash';
import type { ExecutionRequest } from '@opra/core'
import type { Repository, SqbClient, SqbConnection } from '@sqb/connect';

export namespace SQBAdapter {

  export async function execute(connection: SqbClient | SqbConnection, request: ExecutionRequest): Promise<{
    total?: number;
    items?: any[];
  }> {
    const {query} = request;
    if (query.queryType === 'search') {
      const repo = connection.getRepository(query.resource.dataType.ctor);
      const options: Repository.FindAllOptions = {
        elements: query.pick?.length ? query.pick : undefined,
        exclude: query.omit?.length ? query.omit : undefined,
        limit: query.limit,
        offset: query.skip,
        distinct: query.distinct
      };
      const out: any = {};
      if (query.total)
        out.total = await repo.count(options);
      out.items = await repo.findAll(_.omitBy(options, _.isNil));

      return out;
    }
    throw new Error(`Unimplemented query type "${query.queryType}"`);
  }

}

