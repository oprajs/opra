import '@sqb/sqljs';
import {
  OpraCreateInstanceQuery, OpraDeleteCollectionQuery, OpraDeleteInstanceQuery,
  OpraGetInstanceQuery,
  OpraSearchCollectionQuery,
  OpraService, OpraUpdateCollectionQuery,
  OpraUpdateInstanceQuery
} from '@opra/schema';
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

  describe('CreateInstanceQuery', function () {
    it('Should prepare', async () => {
      const values = {a: 1};
      const query = new OpraCreateInstanceQuery(service.getResource('Books'), values);
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.args).toStrictEqual([o.values, o.options]);
    });

    it('Should prepare with "pick" option', async () => {
      const values = {a: 1};
      const query = new OpraCreateInstanceQuery(service.getEntityResource('Books'), values, {
        pick: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'name', 'writer.name']);
    });

    it('Should prepare "omit" option', async () => {
      const values = {a: 1};
      const query = new OpraCreateInstanceQuery(service.getEntityResource('Books'), values, {
        omit: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'name', 'writer.name']);
      expect(o.args).toStrictEqual([o.values, o.options]);
    });

    it('Should prepare "include" option', async () => {
      const values = {a: 1};
      const query = new OpraCreateInstanceQuery(service.getEntityResource('Books'), values, {
        include: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'name', 'writer.name']);
      expect(o.args).toStrictEqual([o.values, o.options]);
    });
  });


  describe('GetInstanceQuery', function () {
    it('Should prepare', async () => {
      const query = new OpraGetInstanceQuery(service.getResource('Books'), 1);
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
    });

    it('Should prepare with "pick" option', async () => {
      const query = new OpraGetInstanceQuery(service.getEntityResource('Books'), 1, {
        pick: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'name', 'writer.name']);
    });

    it('Should prepare with "omit" option', async () => {
      const query = new OpraGetInstanceQuery(service.getEntityResource('Books'), 1, {
        omit: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'name', 'writer.name']);
    });

    it('Should prepare with "include" option', async () => {
      const query = new OpraGetInstanceQuery(service.getEntityResource('Books'), 1, {
        include: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'name', 'writer.name']);
    });
  });

  describe('SearchCollectionQuery', function () {
    it('Should prepare', async () => {
      const query = new OpraSearchCollectionQuery(service.getResource('Books'));
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([o.options]);
    })

    it('Should prepare "limit" option', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {limit: 5});
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({limit: 5});
      expect(o.args).toStrictEqual([o.options]);
    })

    it('Should prepare "offset" option', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {skip: 5});
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({offset: 5});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare "distinct" option', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {distinct: true});
      const o = SQBAdapter.prepare(query);
      const options = {distinct: true};
      expect(o).toStrictEqual({
        method: 'findAll',
        options,
        args: [options]
      });
    })

    it('Should prepare "total" option', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {count: true});
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({total: true});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "pick" option', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        pick: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({pick: ['id', 'name', 'writer.name']});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "omit" option', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        omit: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({omit: ['id', 'name', 'writer.name']});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "include" option', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        include: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({include: ['id', 'name', 'writer.name']});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "filter" option', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name=Demons'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options.filter).toBeDefined();
      expect(o.args).toStrictEqual([o.options]);
    });
  });

  describe('UpdateInstanceQuery', function () {

    it('Should prepare', async () => {
      const values = {a: 2};
      const query = new OpraUpdateInstanceQuery(service.getResource('Books'), 1, values);
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('update');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
    });

    it('Should prepare with "pick" option', async () => {
      const values = {a: 2};
      const query = new OpraUpdateInstanceQuery(service.getResource('Books'), 1, values, {
        pick: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('update');
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'name', 'writer.name']);
    });

    it('Should prepare with "omit" option', async () => {
      const values = {a: 2};
      const query = new OpraUpdateInstanceQuery(service.getResource('Books'), 1, values, {
        omit: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('update');
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'name', 'writer.name']);
    });

    it('Should prepare with "include" option', async () => {
      const values = {a: 2};
      const query = new OpraUpdateInstanceQuery(service.getResource('Books'), 1, values, {
        include: ['id', 'name', 'writer.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('update');
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'name', 'writer.name']);
    });

  });

  describe('UpdateCollectionQuery', function () {
    it('Should prepare', async () => {
      const values = {a: 2};
      const query = new OpraUpdateCollectionQuery(service.getResource('Books'), values);
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('updateAll');
      expect(o.options).toBeDefined();
    })

    it('Should prepare with "filter" option', async () => {
      const values = {a: 2};
      const query = new OpraUpdateCollectionQuery(service.getResource('Books'), values, {
        filter: 'name=Demons'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('updateAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter).toBeDefined();
    })
  });

  describe('DeleteInstanceQuery', function () {
    it('Should prepare', async () => {
      const query = new OpraDeleteInstanceQuery(service.getResource('Books'), 1);
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('destroy');
      expect(o.keyValue).toStrictEqual(1);
    });

  });

  describe('DeleteCollectionQuery', function () {
    it('Should prepare', async () => {
      const query = new OpraDeleteCollectionQuery(service.getResource('Books'));
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('destroyAll');
      expect(o.options).toBeDefined();
    })

    it('Should prepare with "filter" option', async () => {
      const query = new OpraDeleteCollectionQuery(service.getResource('Books'), {
        filter: 'name=Demons'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('destroyAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter).toBeDefined();
    })
  });

  describe('Convert filter ast to SQB', function () {
    it('Should convert StringLiteral', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name="Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual('Demons');
    });

    it('Should convert NumberLiteral', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name=10'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual(10);
    });

    it('Should convert BooleanLiteral', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name=true'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual(true);
    });

    it('Should convert NullLiteral', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name=null'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual(null);
    });

    it('Should convert DateLiteral', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name="2020-06-11T12:30:15"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual('2020-06-11T12:30:15');
    });

    it('Should convert TimeLiteral', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name="12:30:15"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual('12:30:15');
    });

    it('Should convert ComparisonExpression(=)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name="Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.eq);
    });

    it('Should convert ComparisonExpression(!=)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name!="Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.ne);
    });

    it('Should convert ComparisonExpression(>)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'pages>5'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.gt);
    });

    it('Should convert ComparisonExpression(>=)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'pages>=5'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.gte);
    });

    it('Should convert ComparisonExpression(<)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'pages<5'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.lt);
    });

    it('Should convert ComparisonExpression(<=)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'pages<=5'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.lte);
    });

    it('Should convert ComparisonExpression(in)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'pages in [5,6]'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual([5, 6]);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.in);
    });

    it('Should convert ComparisonExpression(!in)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'pages !in [5,6]'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual([5, 6]);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notIn);
    });

    it('Should convert ComparisonExpression(like)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name like "Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.like);
    });

    it('Should convert ComparisonExpression(ilike)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name ilike "Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.iLike);
    });

    it('Should convert ComparisonExpression(!like)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name !like "Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notLike);
    });

    it('Should convert ComparisonExpression(!like)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'name !ilike "Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notILike);
    });

    it('Should convert LogicalExpression(or)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'page=1 or page=2'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.or);
      expect(o.options.filter._items[0]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    });

    it('Should convert LogicalExpression(and)', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: 'page=1 and name = "Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.and);
      expect(o.options.filter._items[0]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    });

    it('Should convert ParenthesesExpression', async () => {
      const query = new OpraSearchCollectionQuery(service.getEntityResource('Books'), {
        filter: '(page=1 or page=2) and name = "Demons"'
      });
      const o = SQBAdapter.prepare(query);
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

