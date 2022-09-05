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

  it('Should "search" api execute Repository.findAll', async () => {
    const value = [{a: 1}];
    let args;
    const conn = getMockClient({
      findAll: (opts) => {
        args = opts;
        return value;
      }
    });
    const query = ExecutionQuery.forSearch(service.getResource('Books'), {limit: 5});
    const request = new ExecutionRequest({query});
    const result = await SQBAdapter.execute(conn, request).catch();
    expect(args).toStrictEqual({limit: 5});
    expect(result).toStrictEqual({value});
  })

  it('Should "read" api execute Repository.findOne', async () => {
    const value = {a: 1};
    let args;
    const conn = getMockClient({
      findOne: (_args) => {
        args = _args;
        return value;
      }
    });
    const query = ExecutionQuery.forRead(service.getResource('Books'), 1, {pick: ['id', 'name']});
    const request = new ExecutionRequest({query});
    const result = await SQBAdapter.execute(conn, request).catch();
    expect({...args, filter: undefined}).toStrictEqual({pick: ['id', 'name'], filter: undefined});
    expect(args.filter).toBeDefined();
    expect(args.filter._operatorType).toStrictEqual('eq');
    expect(args.filter._left._field).toStrictEqual('id');
    expect(args.filter._right).toStrictEqual(1);
    expect(result).toStrictEqual({value});
  })

  it('Should "delete" api execute Repository.destroy', async () => {
    let args;
    const conn = getMockClient({
      destroy: (_args) => {
        args = _args;
        return true;
      }
    });
    const query = ExecutionQuery.forDelete(service.getResource('Books'), 1);
    const request = new ExecutionRequest({query});
    const result = await SQBAdapter.execute(conn, request).catch();
    expect(args.filter).toBeDefined();
    expect(args.filter._operatorType).toStrictEqual('eq');
    expect(args.filter._left._field).toStrictEqual('id');
    expect(args.filter._right).toStrictEqual(1);
    expect(result).toStrictEqual({affected: 1});
  })

  it('Should "deleteMany" api execute Repository.destroyAll', async () => {
    let args;
    const conn = getMockClient({
      destroyAll: (opts) => {
        args = opts;
        return 2;
      }
    });
    const query = ExecutionQuery.forDeleteMany(service.getResource('Books'), {filter: 'page=1'});
    const request = new ExecutionRequest({query});
    const result = await SQBAdapter.execute(conn, request).catch();
    expect(args.filter).toBeDefined();
    expect(result).toStrictEqual({affected: 2});
  })

});

