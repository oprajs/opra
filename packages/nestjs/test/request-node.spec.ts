import {Expression, OpraURL} from '@opra/url';
import {Customer} from './_support/test-app/svc/customer/customer.dto.js';
import {OpraHttpContextHost} from '../src/index.js';


describe('HttpContextHost', function () {

  const sessionContext = {user: 123};
  const executionContext: any = {
    getClass() {
      return Object
    },
    switchToHttp() {
      return this
    },
  };

  it('Should create HttpContextHost instance', async function () {
    const url = new OpraURL('/Customer');
    const node = OpraHttpContextHost.create({
        url,
        entity: Customer,
        executionContext,
        sessionContext
      }
    );
    expect(node.getParent()).toStrictEqual(undefined);
    expect(node.getController()).toBe(Object);
    expect(node.getEntity()).toBe(Customer);
    expect(node.getSessionContext()).toBe(sessionContext);
    expect(node.getCurrentPath()).toStrictEqual(undefined);
    expect(node.getQuery()).toBeInstanceOf(Object);
    expect(node.getThisValue()).toStrictEqual(undefined);
    expect(node.switchToHttp()).toBe(node);
    expect(node.switchToHttp().getUrl()).toBe(url);
    expect(node.switchToExecutionContext()).toBe(executionContext);
  });

  it('Should create collection request', async function () {
    const node = OpraHttpContextHost.create({
        url: new OpraURL('/Customer'),
        entity: Customer,
        executionContext,
        sessionContext
      }
    );
    const q = node.getQuery();

    expect(q.type).toBe(Customer);
    expect(q.resourceName).toStrictEqual('Customer');
    expect(q.keyValue).toStrictEqual(undefined);
    expect(q.properties).toStrictEqual(undefined);
    expect(q.limit).toStrictEqual(undefined);
    expect(q.skip).toStrictEqual(undefined);
    expect(q.distinct).toStrictEqual(undefined);
    expect(q.total).toStrictEqual(undefined);
  });

  it('Should create collection request with query parameters', async function () {
    const node = OpraHttpContextHost.create({
        url: new OpraURL('/Customer')
          .setLimit(15)
          .setSkip(5)
          .setDistinct(true)
          .setTotal(true)
          .setFilter('a=1'),
        entity: Customer,
        executionContext,
        sessionContext
      }
    );
    const q = node.getQuery();

    expect(q.type).toBe(Customer);
    expect(q.resourceName).toStrictEqual('Customer');
    expect(q.keyValue).toStrictEqual(undefined);
    expect(q.properties).toStrictEqual(undefined);
    expect(q.filter).toBeInstanceOf(Expression);
    expect(q.limit).toStrictEqual(15);
    expect(q.skip).toStrictEqual(5);
    expect(q.distinct).toStrictEqual(true);
    expect(q.total).toStrictEqual(true);
  });

  it('Should create entity request', async function () {
    const node = OpraHttpContextHost.create({
        url: new OpraURL('/Customer@12345'),
        entity: Customer,
        executionContext,
        sessionContext
      }
    );
    const q = node.getQuery();

    expect(q.type).toBe(Customer);
    expect(q.resourceName).toStrictEqual('Customer');
    expect(q.keyValue).toStrictEqual('12345');
  });

  /*
    it('Should create entity request', async function () {
      const node = ContextHost.create(
        new OpraURL('/Customer@123'),
        Customer, executionContext, sessionContext
      );
      expect(node.resourceName).toStrictEqual('Customer');
      expect(node.keyValue).toStrictEqual('123');
      expect(node.elements).toStrictEqual(undefined);
      expect(node.path).toStrictEqual([]);
    });

    it('Should create entity request', async function () {
      const node = ContextHost.create(
        new OpraURL('/Customer@123/givenName'),
        Customer, executionContext, sessionContext
      );
      expect(node.resourceName).toStrictEqual('Customer');
      expect(node.keyValue).toStrictEqual('123');
      expect(node.elements).toStrictEqual(['givenName']);
      expect(node.path).toStrictEqual([]);
    });
  */
});
