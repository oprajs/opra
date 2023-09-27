import 'reflect-metadata';
import '@opra/sqb';
import { ApiField, ComplexType, DATATYPE_METADATA, OmitType, PickType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Customer } from '../_support/test-app/entities/customer.entity.js';

describe('MappedType augmentation', function () {

  it('Should inject into OmitType() decorator', async function () {

    @ComplexType({description: 'TestClass schema'})
    class TestClass extends OmitType(Customer, ['gender']) {
      @ApiField()
      @Column()
      sex: string;
    }

    const base = Object.getPrototypeOf(TestClass);
    const metadata = Reflect.getMetadata(DATATYPE_METADATA, base);
    expect(metadata).toStrictEqual({
      kind: 'MappedType',
      base: Customer,
      omit: ['gender'],
    });
    const sqbMeta = Entity.getMetadata(TestClass);
    expect(sqbMeta).toBeDefined();
    const keys = Object.keys((sqbMeta as any).fields);
    expect(keys).toContain('_id');
    expect(keys).toContain('sex');
    expect(keys).not.toContain('gender');
  })

  it('Should inject into PickType() decorator', async function () {

    @ComplexType({description: 'TestClass schema'})
    class TestClass extends PickType(Customer, ['gender']) {
      @ApiField()
      @Column()
      sex: string;
    }

    const base = Object.getPrototypeOf(TestClass);
    const metadata = Reflect.getMetadata(DATATYPE_METADATA, base);
    expect(metadata).toStrictEqual({
      kind: 'MappedType',
      base: Customer,
      pick: ['gender'],
    });
    const sqbMeta = Entity.getMetadata(TestClass);
    expect(sqbMeta).toBeDefined();
    const keys = Object.keys((sqbMeta as any).fields);
    expect(keys).not.toContain('id');
    expect(keys).toContain('sex');
    expect(keys).toContain('gender');
    expect(keys).not.toContain('id');
  })

})
