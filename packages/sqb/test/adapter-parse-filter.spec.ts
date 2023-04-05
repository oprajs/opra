import { ApiDocument } from '@opra/common';
import { CollectionSearchQuery } from '@opra/core';
import { OperatorType, SerializationType } from '@sqb/builder';
import { SQBAdapter } from '../src/index.js';
import { createApp } from './_support/app/index.js';

describe('SQBAdapter.parseFilter', function () {
  let api: ApiDocument;

  beforeAll(async () => {
    api = (await createApp()).document;
  })

  it('Should convert StringLiteral', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name="Demons"'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.options.filter._right).toStrictEqual('Demons');
  });

  it('Should convert NumberLiteral', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name=10'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.options.filter._right).toStrictEqual(10);
  });

  it('Should convert BooleanLiteral', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name=true'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.options.filter._right).toStrictEqual(true);
  });

  it('Should convert NullLiteral', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name=null'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.options.filter._right).toStrictEqual(null);
  });

  it('Should convert DateLiteral', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name="2020-06-11T12:30:15"'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.options.filter._right).toStrictEqual('2020-06-11T12:30:15');
  });

  it('Should convert TimeLiteral', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name="12:30:15"'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.options.filter._right).toStrictEqual('12:30:15');
  });

  it('Should convert ComparisonExpression(=)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name="Demons"'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('name');
    expect(o.options.filter._right).toStrictEqual('Demons');
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.eq);
  });

  it('Should convert ComparisonExpression(!=)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name!="Demons"'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('name');
    expect(o.options.filter._right).toStrictEqual('Demons');
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.ne);
  });

  it('Should convert ComparisonExpression(>)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'pages>5'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('pages');
    expect(o.options.filter._right).toStrictEqual(5);
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.gt);
  });

  it('Should convert ComparisonExpression(>=)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'pages>=5'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('pages');
    expect(o.options.filter._right).toStrictEqual(5);
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.gte);
  });

  it('Should convert ComparisonExpression(<)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'pages<5'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('pages');
    expect(o.options.filter._right).toStrictEqual(5);
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.lt);
  });

  it('Should convert ComparisonExpression(<=)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'pages<=5'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('pages');
    expect(o.options.filter._right).toStrictEqual(5);
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.lte);
  });

  it('Should convert ComparisonExpression(in)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'pages in [5,6]'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('pages');
    expect(o.options.filter._right).toStrictEqual([5, 6]);
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.in);
  });

  it('Should convert ComparisonExpression(!in)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'pages !in [5,6]'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('pages');
    expect(o.options.filter._right).toStrictEqual([5, 6]);
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notIn);
  });

  it('Should convert ComparisonExpression(like)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name like "Demons"'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('name');
    expect(o.options.filter._right).toStrictEqual('Demons');
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.like);
  });

  it('Should convert ComparisonExpression(ilike)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name ilike "Demons"'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('name');
    expect(o.options.filter._right).toStrictEqual('Demons');
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.iLike);
  });

  it('Should convert ComparisonExpression(!like)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name !like "Demons"'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('name');
    expect(o.options.filter._right).toStrictEqual('Demons');
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notLike);
  });

  it('Should convert ComparisonExpression(!like)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'name !ilike "Demons"'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    expect(o.options.filter._left).toStrictEqual('name');
    expect(o.options.filter._right).toStrictEqual('Demons');
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notILike);
  });

  it('Should convert LogicalExpression(or)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'page=1 or page=2'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.or);
    expect(o.options.filter._items[0]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
  });

  it('Should convert LogicalExpression(and)', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: 'page=1 and name = "Demons"'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.and);
    expect(o.options.filter._items[0]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
  });

  it('Should convert ParenthesesExpression', async () => {
    const query = new CollectionSearchQuery(api.getCollection('Customers'), {
      filter: '(page=1 or page=2) and name = "Demons"'
    });
    const o = SQBAdapter.parseQuery(query);
    expect(o.method).toStrictEqual(query.method);
    expect(o.options).toBeDefined();
    expect(o.options.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
    expect(o.options.filter._operatorType).toStrictEqual(OperatorType.and);
    expect(o.options.filter._items[0]._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
    expect(o.options.filter._items[0]._operatorType).toStrictEqual(OperatorType.or);
    expect(o.options.filter._items[1]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
  });

});

