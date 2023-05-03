import 'reflect-metadata';
import '@opra/sqb';
import { ApiField, ComplexType, METADATA_KEY, OmitType, PickType } from '@opra/common';
import { Customer } from '@opra/common/test/_support/test-api';
import { Column, Entity } from '@sqb/connect';

describe('MappedType augmentation', function () {

  it('Should inject into OmitType() decorator', async function () {

    @ComplexType({description: 'TestClass schema'})
    class TestClass extends OmitType(Customer, ['gender']) {
      @ApiField()
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
    const metadata = Reflect.getMetadata(METADATA_KEY, base);
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
    expect(keys).not.toContain('id');
  })

})
