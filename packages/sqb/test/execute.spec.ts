import '@sqb/sqljs';
import { ExecutionQuery, ExecutionRequest, OpraService } from '@opra/core';
import { Repository, SqbClient } from '@sqb/connect';
import { SQBAdapter } from '../src/index.js';
import { BooksResource } from './_support/book.resource.js';

describe('SQBAdapter.execute', function () {
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

  it('Should "read" api execute Repository.findByPk', async () => {
    const value = {a: 1};
    let args: any;
    const conn = getMockClient({
      findByPk: (..._args) => {
        args = _args;
        return value;
      }
    });
    const query = ExecutionQuery.forRead(service.getResource('Books'), 1, {pick: ['id', 'name']});
    const request = new ExecutionRequest({query});
    const result = await SQBAdapter.execute(conn, request).catch();
    expect(args).toBeDefined();
    expect(args.length).toStrictEqual(2);
    expect(args[0]).toStrictEqual(1);
    expect(args[1].pick).toStrictEqual(['id', 'name']);
    expect(result).toStrictEqual({value});
  })

  it('Should "search" api execute Repository.findAll', async () => {
    const value = [{a: 1}];
    let args;
    const conn = getMockClient({
      findAll: (..._args) => {
        args = _args;
        return value;
      }
    });
    const query = ExecutionQuery.forSearch(service.getResource('Books'), {limit: 5});
    const request = new ExecutionRequest({query});
    const result = await SQBAdapter.execute(conn, request).catch();
    expect(args).toBeDefined();
    expect(args.length).toStrictEqual(1);
    expect(args[0]).toStrictEqual({limit: 5});
    expect(result).toStrictEqual({value});
  })

  it('Should "update" api execute Repository.update', async () => {
    let args;
    const value = {a: 1};
    const conn = getMockClient({
      update: (..._args) => {
        args = _args;
        return value;
      }
    });
    const query = ExecutionQuery.forUpdate(service.getResource('Books'), 1, value);
    const request = new ExecutionRequest({query});
    const result = await SQBAdapter.execute(conn, request).catch();
    expect(args).toBeDefined();
    expect(args.length).toStrictEqual(3);
    expect(args[0]).toStrictEqual(1);
    expect(args[1]).toStrictEqual(value);
    expect(result).toStrictEqual({value});
  })

  it('Should "updateMany" api execute Repository.updateAll', async () => {
    let args;
    const value = {a: 1};
    const conn = getMockClient({
      updateAll: (..._args) => {
        args = _args;
        return 2;
      }
    });
    const query = ExecutionQuery.forUpdateMany(service.getResource('Books'), value, {filter: 'page=1'});
    const request = new ExecutionRequest({query});
    const result = await SQBAdapter.execute(conn, request).catch();
    expect(args).toBeDefined();
    expect(args.length).toStrictEqual(2);
    expect(args[0]).toStrictEqual(value);
    expect(args[1].filter).toBeDefined();
    expect(result).toStrictEqual({affected: 2});
  })

  it('Should "delete" api execute Repository.destroy', async () => {
    let args;
    const conn = getMockClient({
      destroy: (..._args) => {
        args = _args;
        return true;
      }
    });
    const query = ExecutionQuery.forDelete(service.getResource('Books'), 1);
    const request = new ExecutionRequest({query});
    const result = await SQBAdapter.execute(conn, request).catch();
    expect(args).toBeDefined();
    expect(args.length).toStrictEqual(2);
    expect(args[0]).toStrictEqual(1);
    expect(result).toStrictEqual({affected: 1});
  })

  it('Should "deleteMany" api execute Repository.destroyAll', async () => {
    let args;
    const conn = getMockClient({
      destroyAll: (..._args) => {
        args = _args;
        return 2;
      }
    });
    const query = ExecutionQuery.forDeleteMany(service.getResource('Books'), {filter: 'page=1'});
    const request = new ExecutionRequest({query});
    const result = await SQBAdapter.execute(conn, request).catch();
    expect(args).toBeDefined();
    expect(args.length).toStrictEqual(1);
    expect(args[0].filter).toBeDefined();
    expect(result).toStrictEqual({affected: 2});
  })

});

