import 'reflect-metadata';
import '@opra/sqb';
import {
  ApiField,
  ComplexType,
  DATATYPE_METADATA,
  OmitType,
  PickType,
} from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { expect } from 'expect';

describe('sqb:MappedType augmentation', () => {
  it('Should inject into OmitType() decorator', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      @Column()
      declare field1: number;
      @ApiField()
      @Column()
      declare field2: any;
      @ApiField()
      @Column()
      declare field3: number;
    }

    @ComplexType()
    class Type2 extends OmitType(Type1, ['field2']) {
      @ApiField()
      @Column()
      declare field4: number;
    }

    const base = Object.getPrototypeOf(Type2);
    const metadata = Reflect.getMetadata(DATATYPE_METADATA, base);
    expect(metadata).toStrictEqual({
      kind: 'MappedType',
      base: Type1,
      omit: ['field2'],
    });
    const sqbMeta = Entity.getMetadata(Type2);
    expect(sqbMeta).toBeDefined();
    const keys = Object.keys((sqbMeta as any).fields);
    expect(keys).toEqual(['field1', 'field3', 'field4']);
  });

  it('Should inject into PickType() decorator', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      @Column()
      declare field1: number;
      @ApiField()
      @Column()
      declare field2: any;
      @ApiField()
      @Column()
      declare field3: number;
    }

    @ComplexType()
    class Type2 extends PickType(Type1, ['field2']) {
      @ApiField()
      @Column()
      declare field4: number;
    }

    const base = Object.getPrototypeOf(Type2);
    const metadata = Reflect.getMetadata(DATATYPE_METADATA, base);
    expect(metadata).toStrictEqual({
      kind: 'MappedType',
      base: Type1,
      pick: ['field2'],
    });
    const sqbMeta = Entity.getMetadata(Type2);
    expect(sqbMeta).toBeDefined();
    const keys = Object.keys((sqbMeta as any).fields);
    expect(keys).toEqual(['field2', 'field4']);
  });
});
