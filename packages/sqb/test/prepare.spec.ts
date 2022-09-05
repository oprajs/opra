import '@sqb/sqljs';
import { ExecutionQuery, ExecutionRequest, OpraService } from '@opra/core';
import { OperatorType, SerializationType } from '@sqb/builder';
import { SQBAdapter } from '../src/index.js';
import { BooksResource } from './_support/book.resource.js';

describe('SQBAdapter', function () {
  let service: OpraService;

  beforeAll(async () => {
    service = await OpraService.create({
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      resources: [new BooksResource()]
    });
  })

  describe('"search" query', function () {

    it('Should prepare for Repository.findAll', async () => {
      const query = ExecutionQuery.forSearch(service.getResource('Books'));
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o).toStrictEqual({
        method: 'findAll',
        args: {}
      });
    })

    it('Should prepare for Repository.findAll with "limit" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {limit: 5});
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o).toStrictEqual({
        method: 'findAll',
        args: {limit: 5}
      });
    })

    it('Should prepare for Repository.findAll with "offset" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {skip: 5});
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o).toStrictEqual({
        method: 'findAll',
        args: {offset: 5}
      });
    });

    it('Should prepare for Repository.findAll with "distinct" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {distinct: true});
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o).toStrictEqual({
        method: 'findAll',
        args: {distinct: true}
      });
    })

    it('Should prepare for Repository.findAll with "total" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {total: true});
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o).toStrictEqual({
        method: 'findAll',
        args: {total: true}
      });
    });

    it('Should prepare for Repository.findAll with "pick" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        pick: ['id', 'name', 'shelf.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o).toStrictEqual({
        method: 'findAll',
        args: {pick: ['id', 'name', 'shelf.name']}
      });
    });

    it('Should prepare for Repository.findAll with "omit" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        omit: ['id', 'name', 'shelf.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o).toStrictEqual({
        method: 'findAll',
        args: {omit: ['id', 'name', 'shelf.name']}
      });
    });

    it('Should prepare for Repository.findAll with "include" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        include: ['id', 'name', 'shelf.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o).toStrictEqual({
        method: 'findAll',
        args: {include: ['id', 'name', 'shelf.name']}
      });
    });

    it('Should prepare for Repository.findAll with "filter" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name=Demons'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter).toBeDefined();
    });
  });

  describe('"read" query', function () {

    it('Should prepare for Repository.findOne', async () => {
      const query = ExecutionQuery.forRead(service.getResource('Books'), 1);
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.args).toBeDefined();
      expect(o.args.filter).toBeDefined();
      expect(o.args.filter._left).toStrictEqual('id');
      expect(o.args.filter._right).toStrictEqual(1);
      expect(o.args.filter._operatorType).toStrictEqual('eq');
    })

  });

  describe('"delete" query', function () {

    it('Should prepare for Repository.destroy', async () => {
      const query = ExecutionQuery.forDelete(service.getResource('Books'), 1);
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('destroy');
      expect(o.args).toBeDefined();
      expect(o.args.filter).toBeDefined();
      expect(o.args.filter._left).toStrictEqual('id');
      expect(o.args.filter._right).toStrictEqual(1);
      expect(o.args.filter._operatorType).toStrictEqual('eq');
    })

  });

  describe('"delete-many" query', function () {

    it('Should prepare for Repository.destroyAll', async () => {
      const query = ExecutionQuery.forDeleteMany(service.getResource('Books'), {
        filter: 'name=Demons'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('destroyAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter).toBeDefined();
    })

  });

  describe('Convert filter ast to SQB', function () {

    it('Should convert StringLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name="Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.args.filter._right).toStrictEqual('Demons');
    });

    it('Should convert NumberLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name=10'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.args.filter._right).toStrictEqual(10);
    });

    it('Should convert BooleanLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name=true'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.args.filter._right).toStrictEqual(true);
    });

    it('Should convert NullLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name=null'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.args.filter._right).toStrictEqual(null);
    });

    it('Should convert DateLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name="2020-06-11T12:30:15"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.args.filter._right).toStrictEqual('2020-06-11T12:30:15');
    });

    it('Should convert TimeLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name="12:30:15"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.args.filter._right).toStrictEqual('12:30:15');
    });

    it('Should convert ComparisonExpression(=)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name="Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('name');
      expect(o.args.filter._right).toStrictEqual('Demons');
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.eq);
    });

    it('Should convert ComparisonExpression(!=)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name!="Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('name');
      expect(o.args.filter._right).toStrictEqual('Demons');
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.ne);
    });

    it('Should convert ComparisonExpression(>)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages>5'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('pages');
      expect(o.args.filter._right).toStrictEqual(5);
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.gt);
    });

    it('Should convert ComparisonExpression(>=)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages>=5'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('pages');
      expect(o.args.filter._right).toStrictEqual(5);
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.gte);
    });

    it('Should convert ComparisonExpression(<)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages<5'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('pages');
      expect(o.args.filter._right).toStrictEqual(5);
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.lt);
    });

    it('Should convert ComparisonExpression(<=)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages<=5'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('pages');
      expect(o.args.filter._right).toStrictEqual(5);
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.lte);
    });

    it('Should convert ComparisonExpression(in)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages in [5,6]'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('pages');
      expect(o.args.filter._right).toStrictEqual([5, 6]);
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.in);
    });

    it('Should convert ComparisonExpression(!in)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages !in [5,6]'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('pages');
      expect(o.args.filter._right).toStrictEqual([5, 6]);
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.notIn);
    });

    it('Should convert ComparisonExpression(like)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name like "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('name');
      expect(o.args.filter._right).toStrictEqual('Demons');
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.like);
    });

    it('Should convert ComparisonExpression(ilike)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name ilike "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('name');
      expect(o.args.filter._right).toStrictEqual('Demons');
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.iLike);
    });

    it('Should convert ComparisonExpression(!like)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name !like "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('name');
      expect(o.args.filter._right).toStrictEqual('Demons');
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.notLike);
    });

    it('Should convert ComparisonExpression(!like)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name !ilike "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.args.filter._left).toStrictEqual('object');
      expect(o.args.filter._left._field).toStrictEqual('name');
      expect(o.args.filter._right).toStrictEqual('Demons');
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.notILike);
    });

    it('Should convert LogicalExpression(or)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'page=1 or page=2'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.or);
      expect(o.args.filter._items[0]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    });

    it('Should convert LogicalExpression(and)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'page=1 and name = "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.and);
      expect(o.args.filter._items[0]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    });

    it('Should convert ParenthesesExpression', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: '(page=1 or page=2) and name = "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.args).toBeDefined();
      expect(o.args.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.args.filter._operatorType).toStrictEqual(OperatorType.and);
      expect(o.args.filter._items[0]._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.args.filter._items[0]._operatorType).toStrictEqual(OperatorType.or);
      expect(o.args.filter._items[1]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    });

  });

});

