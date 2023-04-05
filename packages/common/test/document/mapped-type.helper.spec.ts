import 'reflect-metadata';
import '@opra/sqb';
import { ComplexType, Expose, METADATA_KEY, OmitType, PickType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Customer } from '../_support/test-doc/index.js';

describe('MappedType', function () {

  it('Should OmitType() create MappedType class and define metadata', async function () {

    @ComplexType({description: 'TestClass schema'})
    class TestClass extends OmitType(Customer, ['gender']) {
      @Expose()
      @Column()
      sex: string;
    }

    const base = Object.getPrototypeOf(TestClass);
    const metadata = Reflect.getMetadata(METADATA_KEY, base);
    expect(metadata).toStrictEqual({
      kind: 'MappedType',
      omit: ['gender'],
      type: Customer
    });
    const sqbMeta = Entity.getMetadata(TestClass);
    expect(sqbMeta).toBeDefined();
    const keys = Object.keys((sqbMeta as any).fields);
    expect(keys).toContain('id');
    expect(keys).toContain('sex');
    expect(keys).not.toContain('gender');
  })

  it('Should PickType() create MappedType class and define metadata', async function () {

    @ComplexType({description: 'TestClass schema'})
    class TestClass extends PickType(Customer, ['gender']) {
      @Expose()
      @Column()
      sex: string;
    }

    const base = Object.getPrototypeOf(TestClass);
    const metadata =  Reflect.getMetadata(METADATA_KEY, base);
    expect(metadata).toStrictEqual({
      kind: 'MappedType',
      pick: ['gender'],
      type: Customer
    });
    const sqbMeta = Entity.getMetadata(TestClass);
    expect(sqbMeta).toBeDefined();
    const keys = Object.keys((sqbMeta as any).fields);
    expect(keys).not.toContain('id');
    expect(keys).toContain('sex');
    expect(keys).toContain('gender');
  })

})
