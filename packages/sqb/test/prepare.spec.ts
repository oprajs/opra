import '@sqb/sqljs';
import { ExecutionQuery, ExecutionRequest, OpraService } from '@opra/core';
import { OperatorType, SerializationType } from '@sqb/builder';
import { SQBAdapter } from '../src/index.js';
import { BooksResource } from './_support/book.resource.js';

describe('SQBAdapter.prepare', function () {
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

  describe('"create" query', function () {
    it('Should prepare', async () => {
      const values = {a: 1};
      const query = ExecutionQuery.forCreate(service.getResource('Books'), values);
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.args).toStrictEqual([o.values, o.options]);
    });

    it('Should prepare with "pick" option', async () => {
      const values = {a: 1};
      const query = ExecutionQuery.forCreate(service.getEntityResource('Books'), values, {
        pick: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'name', 'writer.name']);
    });

    it('Should prepare "omit" option', async () => {
      const values = {a: 1};
      const query = ExecutionQuery.forCreate(service.getEntityResource('Books'), values, {
        omit: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'name', 'writer.name']);
      expect(o.args).toStrictEqual([o.values, o.options]);
    });

    it('Should prepare "include" option', async () => {
      const values = {a: 1};
      const query = ExecutionQuery.forCreate(service.getEntityResource('Books'), values, {
        include: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'name', 'writer.name']);
      expect(o.args).toStrictEqual([o.values, o.options]);
    });
  });


  describe('"read" query', function () {
    it('Should prepare', async () => {
      const query = ExecutionQuery.forGet(service.getResource('Books'), 1);
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
    });

    it('Should prepare with "pick" option', async () => {
      const query = ExecutionQuery.forGet(service.getEntityResource('Books'), 1, {
        pick: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'name', 'writer.name']);
    });

    it('Should prepare with "omit" option', async () => {
      const query = ExecutionQuery.forGet(service.getEntityResource('Books'), 1, {
        omit: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'name', 'writer.name']);
    });

    it('Should prepare with "include" option', async () => {
      const query = ExecutionQuery.forGet(service.getEntityResource('Books'), 1, {
        include: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'name', 'writer.name']);
    });
  });

  describe('"search" query', function () {
    it('Should prepare', async () => {
      const query = ExecutionQuery.forSearch(service.getResource('Books'));
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([o.options]);
    })

    it('Should prepare "limit" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {limit: 5});
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({limit: 5});
      expect(o.args).toStrictEqual([o.options]);
    })

    it('Should prepare "offset" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {skip: 5});
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({offset: 5});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare "distinct" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {distinct: true});
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      const options = {distinct: true};
      expect(o).toStrictEqual({
        method: 'findAll',
        options,
        args: [options]
      });
    })

    it('Should prepare "total" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {total: true});
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({total: true});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "pick" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        pick: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({pick: ['id', 'name', 'writer.name']});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "omit" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        omit: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({omit: ['id', 'name', 'writer.name']});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "include" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        include: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({include: ['id', 'name', 'writer.name']});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "filter" option', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name=Demons'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options.filter).toBeDefined();
      expect(o.args).toStrictEqual([o.options]);
    });
  });

  describe('"update" query', function () {

    it('Should prepare', async () => {
      const values = {a: 2};
      const query = ExecutionQuery.forUpdate(service.getResource('Books'), 1, values);
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('update');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
    });

    it('Should prepare with "pick" option', async () => {
      const values = {a: 2};
      const query = ExecutionQuery.forUpdate(service.getResource('Books'), 1, values, {
        pick: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('update');
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'name', 'writer.name']);
    });

    it('Should prepare with "omit" option', async () => {
      const values = {a: 2};
      const query = ExecutionQuery.forUpdate(service.getResource('Books'), 1, values, {
        omit: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('update');
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'name', 'writer.name']);
    });

    it('Should prepare with "include" option', async () => {
      const values = {a: 2};
      const query = ExecutionQuery.forUpdate(service.getResource('Books'), 1, values, {
        include: ['id', 'name', 'writer.name']
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('update');
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'name', 'writer.name']);
    });

  });

  describe('"update-many" query', function () {
    it('Should prepare', async () => {
      const values = {a: 2};
      const query = ExecutionQuery.forUpdateMany(service.getResource('Books'), values);
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('updateAll');
      expect(o.options).toBeDefined();
    })

    it('Should prepare with "filter" option', async () => {
      const values = {a: 2};
      const query = ExecutionQuery.forUpdateMany(service.getResource('Books'), values, {
        filter: 'name=Demons'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('updateAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter).toBeDefined();
    })
  });

  describe('"delete" query', function () {
    it('Should prepare', async () => {
      const query = ExecutionQuery.forDelete(service.getResource('Books'), 1);
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('destroy');
      expect(o.keyValue).toStrictEqual(1);
    });

  });

  describe('"delete-many" query', function () {
    it('Should prepare', async () => {
      const query = ExecutionQuery.forDeleteMany(service.getResource('Books'));
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('destroyAll');
      expect(o.options).toBeDefined();
    })

    it('Should prepare with "filter" option', async () => {
      const query = ExecutionQuery.forDeleteMany(service.getResource('Books'), {
        filter: 'name=Demons'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('destroyAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter).toBeDefined();
    })
  });

  describe('Convert filter ast to SQB', function () {
    it('Should convert StringLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name="Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.options.filter._right).toStrictEqual('Demons');
    });

    it('Should convert NumberLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name=10'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.options.filter._right).toStrictEqual(10);
    });

    it('Should convert BooleanLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name=true'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.options.filter._right).toStrictEqual(true);
    });

    it('Should convert NullLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name=null'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.options.filter._right).toStrictEqual(null);
    });

    it('Should convert DateLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name="2020-06-11T12:30:15"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.options.filter._right).toStrictEqual('2020-06-11T12:30:15');
    });

    it('Should convert TimeLiteral', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name="12:30:15"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.options.filter._right).toStrictEqual('12:30:15');
    });

    it('Should convert ComparisonExpression(=)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name="Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.eq);
    });

    it('Should convert ComparisonExpression(!=)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name!="Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.ne);
    });

    it('Should convert ComparisonExpression(>)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages>5'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.gt);
    });

    it('Should convert ComparisonExpression(>=)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages>=5'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.gte);
    });

    it('Should convert ComparisonExpression(<)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages<5'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.lt);
    });

    it('Should convert ComparisonExpression(<=)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages<=5'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.lte);
    });

    it('Should convert ComparisonExpression(in)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages in [5,6]'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual([5, 6]);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.in);
    });

    it('Should convert ComparisonExpression(!in)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'pages !in [5,6]'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual([5, 6]);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notIn);
    });

    it('Should convert ComparisonExpression(like)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name like "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.like);
    });

    it('Should convert ComparisonExpression(ilike)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name ilike "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.iLike);
    });

    it('Should convert ComparisonExpression(!like)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name !like "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notLike);
    });

    it('Should convert ComparisonExpression(!like)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'name !ilike "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(typeof o.options.filter._left).toStrictEqual('object');
      expect(o.options.filter._left._field).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notILike);
    });

    it('Should convert LogicalExpression(or)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'page=1 or page=2'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.or);
      expect(o.options.filter._items[0]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    });

    it('Should convert LogicalExpression(and)', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: 'page=1 and name = "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.and);
      expect(o.options.filter._items[0]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    });

    it('Should convert ParenthesesExpression', async () => {
      const query = ExecutionQuery.forSearch(service.getEntityResource('Books'), {
        filter: '(page=1 or page=2) and name = "Demons"'
      });
      const request = new ExecutionRequest({query});
      const o = SQBAdapter.prepare(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.and);
      expect(o.options.filter._items[0]._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.options.filter._items[0]._operatorType).toStrictEqual(OperatorType.or);
      expect(o.options.filter._items[1]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    });
  });

});

