import '@sqb/sqljs';
import { ExecutionQuery, ExecutionRequest, OpraService } from '@opra/core';
import { Repository, SqbClient } from '@sqb/connect';
import { SQBAdapter } from '../src/index.js';
import { BooksResource } from './_support/book.resource.js';

describe('SQBAdapter', function () {
  let service: OpraService;
  let _client: SqbClient;
  beforeAll(async () => {
    _client = new SqbClient({
      dialect: 'sqlite'
    });
    service = await OpraService.create({
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      resources: [new BooksResource()]
    });
  })

  function getMockClient(repoOverwrite: any): SqbClient {
    const client = {
      getRepository: (entity, opts) => {
        const repo = _client.getRepository(entity, opts);
        const out = {
          ...repoOverwrite
        }
        Object.setPrototypeOf(out, repo);
        return out as unknown as Repository<any>;
      }
    }
    Object.setPrototypeOf(client, _client);
    return client as unknown as SqbClient;
  }

  describe('"search" api method', function () {
    const items = [{a: 1}];

    it('Should execute Repository.findAll', async () => {
      const conn = getMockClient({
        findAll: () => items
      });
      const query = ExecutionQuery.forSearch(service.getResource('Books'));
      const request = new ExecutionRequest({query});
      const result = await SQBAdapter.execute(conn, request).catch();
      expect(result).toStrictEqual({items});
    })

    it('Should execute Repository.findAll with "limit" option', async () => {
      let opts;
      const conn = getMockClient({
        findAll: (options) => opts = options
      });
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {limit: 5});
      const request = new ExecutionRequest({query});
      await SQBAdapter.execute(conn, request);
      expect(opts).toStrictEqual({limit: 5});
    })

    it('Should execute Repository.findAll with "offset" option', async () => {
      let opts;
      const conn = getMockClient({
        findAll: (options) => opts = options
      });
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {skip: 5});
      const request = new ExecutionRequest({query});
      await SQBAdapter.execute(conn, request);
      expect(opts).toStrictEqual({offset: 5});

    })

    it('Should execute Repository.findAll with "distinct" option', async () => {
      let opts;
      const conn = getMockClient({
        findAll: (options) => opts = options
      });
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {distinct: true});
      const request = new ExecutionRequest({query});
      await SQBAdapter.execute(conn, request);
      expect(opts).toStrictEqual({distinct: true});
    })

    it('Should execute Repository.findAll with "total" option', async () => {
      const conn = getMockClient({
        findAll: () => items,
        count: () => 10
      });
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {total: true});
      const request = new ExecutionRequest({query});
      const result = await SQBAdapter.execute(conn, request).catch();
      expect(result).toStrictEqual({total: 10, items});
    })

    it('Should execute Repository.findAll with "pick" option', async () => {
      let opts;
      const conn = getMockClient({
        findAll: (options) => opts = options
      });
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        pick: ['id', 'name', 'shelf.name']
      });
      const request = new ExecutionRequest({query});
      await SQBAdapter.execute(conn, request);
      expect(opts).toStrictEqual({elements: ['id', 'name', 'shelf.name']});
    })

  });

});

