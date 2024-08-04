import '@opra/sqb';
import { ApiDocumentFactory, ApiField, ComplexType, EnumType } from '@opra/common';
import { Column, DataType, Link } from '@sqb/connect';

export enum GenderEnum {
  MALE = 'M',
  FEMALE = 'F',
}

EnumType(GenderEnum, { name: 'GenderEnum' });

describe('Augmentation (DataTypeFactory)', () => {
  it('Should copy data type info (enum)', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      @Column({ enum: GenderEnum })
      field1: any;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, GenderEnum],
    });
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.fields.get('field1')).toBeDefined();
    expect(t.fields.get('field1')?.type.name).toStrictEqual('GenderEnum');
    expect(t.fields.get('field1')?.type.kind).toStrictEqual('EnumType');
  });

  it('Should copy data type info (INTEGER)', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      @Column({ dataType: DataType.INTEGER })
      declare field1: number;
      @ApiField()
      @Column({ dataType: DataType.INTEGER })
      declare field2: any;
      @ApiField({ type: 'number' })
      @Column({ dataType: DataType.INTEGER })
      declare field3: number;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1],
    });
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.fields.get('field1')).toBeDefined();
    expect(t.fields.get('field1')?.type.name).toStrictEqual('integer');
    expect(t.fields.get('field2')).toBeDefined();
    expect(t.fields.get('field2')?.type.name).toStrictEqual('integer');
    expect(t.fields.get('field3')).toBeDefined();
    expect(t.fields.get('field3')?.type.name).toStrictEqual('number');
  });

  it('Should copy data type info (GUID)', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      @Column({ dataType: DataType.GUID })
      declare field1: string;
      @ApiField()
      @Column({ dataType: DataType.GUID })
      declare field2: any;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1],
    });
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.fields.get('field1')).toBeDefined();
    expect(t.fields.get('field1')?.type.name).toStrictEqual('uuid');
    expect(t.fields.get('field2')).toBeDefined();
    expect(t.fields.get('field2')?.type.name).toStrictEqual('uuid');
  });

  it('Should copy data type info (date)', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      @Column({ dataType: DataType.DATE })
      declare field1: string;
      @ApiField()
      @Column({ dataType: DataType.DATE })
      declare field2: any;
      @ApiField()
      @Column({ dataType: DataType.DATE })
      declare field3: Date;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1],
    });
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.fields.get('field1')).toBeDefined();
    expect(t.fields.get('field1')?.type.name).toStrictEqual('datestring');
    expect(t.fields.get('field2')).toBeDefined();
    expect(t.fields.get('field2')?.type.name).toStrictEqual('date');
    expect(t.fields.get('field3')).toBeDefined();
    expect(t.fields.get('field3')?.type.name).toStrictEqual('date');
  });

  it('Should copy data type info (TIMESTAMP)', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      @Column({ dataType: DataType.TIMESTAMP })
      declare field1: string;
      @ApiField()
      @Column({ dataType: DataType.TIMESTAMP })
      declare field2: any;
      @ApiField()
      @Column({ dataType: DataType.TIMESTAMP })
      declare field3: Date;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1],
    });
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.fields.get('field1')).toBeDefined();
    expect(t.fields.get('field1')?.type.name).toStrictEqual('datetimestring');
    expect(t.fields.get('field2')).toBeDefined();
    expect(t.fields.get('field2')?.type.name).toStrictEqual('datetime');
    expect(t.fields.get('field3')).toBeDefined();
    expect(t.fields.get('field3')?.type.name).toStrictEqual('datetime');
  });

  it('Should copy data type info (TIMESTAMPTZ)', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      @Column({ dataType: DataType.TIMESTAMPTZ })
      declare field1: string;
      @ApiField()
      @Column({ dataType: DataType.TIMESTAMPTZ })
      declare field2: any;
      @ApiField()
      @Column({ dataType: DataType.TIMESTAMPTZ })
      declare field3: Date;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1],
    });
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.fields.get('field1')).toBeDefined();
    expect(t.fields.get('field1')?.type.name).toStrictEqual('datetimestring');
    expect(t.fields.get('field2')).toBeDefined();
    expect(t.fields.get('field2')?.type.name).toStrictEqual('datetimestring');
    expect(t.fields.get('field3')).toBeDefined();
    expect(t.fields.get('field3')?.type.name).toStrictEqual('datetime');
  });

  it('Should copy data type info from Association', async () => {
    @ComplexType()
    class Type2 {
      @Column()
      declare id: string;
    }

    @ComplexType()
    class Type1 {
      @ApiField()
      @(Link({}).toOne(Type2))
      declare field1: Type2;
      @ApiField()
      @(Link({}).toMany(Type2))
      declare field2: Type2[];
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.fields.get('field1')).toBeDefined();
    expect(t.fields.get('field1')?.type.name).toStrictEqual('Type2');
    expect(t.fields.get('field1')?.exclusive).toStrictEqual(true);
    expect(t.fields.get('field2')).toBeDefined();
    expect(t.fields.get('field2')?.type.name).toStrictEqual('Type2');
    expect(t.fields.get('field2')?.isArray).toStrictEqual(true);
  });

  it('Should copy "exclusive" property', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      @Column({ exclusive: true })
      declare field1: number;
      @ApiField()
      @Column({ exclusive: false })
      declare field2: number;
      @ApiField({ exclusive: false })
      @Column({ exclusive: true })
      declare field3: number;
      @ApiField({ exclusive: undefined })
      @Column({ exclusive: true })
      declare field4: number;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1],
    });
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.fields.get('field1')).toBeDefined();
    expect(t.fields.get('field1')?.exclusive).toStrictEqual(true);
    expect(t.fields.get('field2')).toBeDefined();
    expect(t.fields.get('field2')?.exclusive).toStrictEqual(false);
    expect(t.fields.get('field3')).toBeDefined();
    expect(t.fields.get('field3')?.exclusive).toStrictEqual(false);
  });
});
