import 'reflect-metadata';
import '@opra/sqb';
import {
  ApiField,
  ComplexType,
  DATATYPE_METADATA,
  MixinType,
} from '@opra/common';
import { Column, Entity } from '@sqb/connect';

describe('MixinType augmentation', () => {
  it('Should inject into MixinType() decorator', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      @Column()
      declare field1: number;
      @ApiField()
      @Column()
      declare field2: any;
    }

    @ComplexType()
    class Type2 {
      @ApiField()
      @Column()
      declare field3: number;
    }

    @ComplexType()
    class Type3 extends MixinType(Type1, Type2) {
      @ApiField()
      @Column()
      declare field4: number;
    }

    const base = Object.getPrototypeOf(Type3);
    const metadata = Reflect.getMetadata(DATATYPE_METADATA, base);
    expect(metadata).toStrictEqual({
      kind: 'MixinType',
      types: [Type1, Type2],
    });
    const sqbMeta = Entity.getMetadata(Type3);
    expect(sqbMeta).toBeDefined();
    const keys = Object.keys((sqbMeta as any).fields);
    expect(keys).toEqual(['field1', 'field2', 'field3', 'field4']);
  });
});
