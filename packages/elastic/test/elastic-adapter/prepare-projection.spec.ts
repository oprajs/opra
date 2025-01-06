import { ApiDocument, ComplexType } from '@opra/common';
import { ElasticAdapter } from '@opra/elastic';
import { CustomerApplication } from 'express-elastic';

describe('ElasticAdapter.prepareProjection', () => {
  let document: ApiDocument;
  let customerType: ComplexType;
  let noteType: ComplexType;

  beforeAll(async () => {
    document = (await CustomerApplication.create()).document;
    customerType = document.node.getComplexType('customer');
    noteType = document.node.getComplexType('note');
  });

  afterAll(() => global.gc && global.gc());

  it('Test-1', async () => {
    const o: any = ElasticAdapter.prepareProjection(customerType);
    expect(o).toStrictEqual({
      excludes: ['address', 'notes', 'country'],
    });
  });

  it('Test-2', async () => {
    const o: any = ElasticAdapter.prepareProjection(customerType, [
      'id',
      'givenname',
      'address',
    ]);
    expect(o).toStrictEqual({
      includes: ['id', 'givenName', 'address'],
    });
  });

  it('Test-3', async () => {
    const o: any = ElasticAdapter.prepareProjection(customerType, [
      'id',
      '+givenname',
      '+address',
    ]);
    expect(o).toStrictEqual({
      includes: ['id', 'givenName', 'address'],
    });
  });

  it('Test-4', async () => {
    const o: any = ElasticAdapter.prepareProjection(customerType, [
      'id',
      '-givenname',
      '-address',
    ]);
    expect(o).toStrictEqual({
      includes: ['id'],
    });
  });

  it('Test-5', async () => {
    const o: any = ElasticAdapter.prepareProjection(customerType, [
      'id',
      'address.city',
    ]);
    expect(o).toStrictEqual({
      includes: ['id', 'address.city'],
    });
  });

  it('Test-6', async () => {
    const o: any = ElasticAdapter.prepareProjection(customerType, [
      'id',
      'address.+city',
    ]);
    expect(o).toStrictEqual({
      includes: ['id', 'address'],
    });
  });

  it('Test-7', async () => {
    const o: any = ElasticAdapter.prepareProjection(customerType, ['+address']);
    expect(o).toStrictEqual({
      excludes: ['notes', 'country'],
    });
  });

  it('Test-8', async () => {
    const o: any = ElasticAdapter.prepareProjection(customerType, [
      'id',
      '-givenname',
      'address.-city',
    ]);
    expect(o).toStrictEqual({
      includes: ['id', 'address'],
      excludes: ['address.city'],
    });
  });

  it('Test-9', async () => {
    const o: any = ElasticAdapter.prepareProjection(customerType, [
      'id',
      '-address',
      'address.city',
    ]);
    expect(o).toStrictEqual({
      includes: ['id'],
    });
  });

  it('Test-10', async () => {
    const o: any = ElasticAdapter.prepareProjection(customerType, [
      'id',
      '-address.+city',
    ]);
    expect(o).toStrictEqual({
      includes: ['id'],
    });
  });

  it('Test-11', async () => {
    const o: any = ElasticAdapter.prepareProjection(noteType, [
      'extra1',
      'extra2',
    ]);
    expect(o).toStrictEqual({
      includes: ['extra1', 'extra2'],
    });
  });

  it('Test-12', async () => {
    const o: any = ElasticAdapter.prepareProjection(noteType, [
      'extra1',
      '-extra2',
    ]);
    expect(o).toStrictEqual({
      includes: ['extra1'],
    });
  });

  it('Test-13', async () => {
    const o: any = ElasticAdapter.prepareProjection(noteType, ['-extra1']);
    expect(o).toStrictEqual({
      excludes: ['largeContent', 'extra1'],
    });
  });
});
