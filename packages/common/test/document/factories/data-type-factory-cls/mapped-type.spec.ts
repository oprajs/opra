import {
  ApiDocumentFactory,
  ApiField,
  ComplexType,
  MappedType,
  OmitType,
  PartialType,
  PickType,
  RequiredType,
} from '@opra/common';

describe('DataTypeFactory - MappedType (Class)', () => {
  afterAll(() => global.gc && global.gc());

  it('Should PickType(class, keys) create a new MappedType class', async () => {
    @ComplexType({
      additionalFields: true,
    })
    class Type1 {
      @ApiField()
      declare id: number;
      @ApiField()
      declare name: string;
      @ApiField()
      declare age: number;
      @ApiField()
      declare gender: string;
    }

    @ComplexType()
    class Type2 extends PickType(Type1, ['id', 'name']) {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('type2');
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Type2');
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name']);
    expect(t1.base).toBeInstanceOf(MappedType);
  });

  it('Should PickType(name, keys) create a new MappedType class', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      declare field1: number;
      @ApiField()
      declare field2: string;
    }

    @ComplexType()
    class Type2 {
      @ApiField({ type: PickType('type1', ['field1']) })
      declare a: Type1;
      @ApiField({ type: PickType(Type1, ['field2']) })
      declare b: Type1;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('type2');
    expect(t1).toBeDefined();
    const a = t1.getField('a');
    expect(a.type.kind).toStrictEqual('MappedType');
    expect(a.type.embedded).toEqual(true);
    expect(Array.from((a.type as MappedType).fields.keys())).toStrictEqual([
      'field1',
    ]);
    const b = t1.getField('b');
    expect(b.type.kind).toStrictEqual('MappedType');
    expect(b.type.embedded).toEqual(true);
    expect(Array.from((b.type as MappedType).fields.keys())).toStrictEqual([
      'field2',
    ]);
  });

  it('Should import MappedType build with OmitType()', async () => {
    @ComplexType({
      additionalFields: true,
    })
    class Type1 {
      @ApiField()
      declare id: number;
      @ApiField()
      declare name: string;
      @ApiField()
      declare age: number;
      @ApiField()
      declare gender: string;
    }

    @ComplexType()
    class Type2 extends OmitType(Type1, ['age', 'gender']) {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('Type2');
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Type2');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name']);
    expect(t1.base).toBeInstanceOf(MappedType);
  });

  it('Should OmitType(name, keys) create a new MappedType class', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      declare field1: number;
      @ApiField()
      declare field2: string;
    }

    @ComplexType()
    class Type2 {
      @ApiField({ type: OmitType('type1', ['field1']) })
      declare a: Type1;
      @ApiField({ type: OmitType(Type1, ['field2']) })
      declare b: Type1;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('type2');
    expect(t1).toBeDefined();
    const a = t1.getField('a');
    expect(a.type.kind).toStrictEqual('MappedType');
    expect(a.type.embedded).toEqual(true);
    expect(Array.from((a.type as MappedType).fields.keys())).toStrictEqual([
      'field2',
    ]);
    const b = t1.getField('b');
    expect(b.type.kind).toStrictEqual('MappedType');
    expect(b.type.embedded).toEqual(true);
    expect(Array.from((b.type as MappedType).fields.keys())).toStrictEqual([
      'field1',
    ]);
  });

  it('Should PartialType(class, keys) create a new MappedType class', async () => {
    @ComplexType({
      additionalFields: true,
    })
    class Type1 {
      @ApiField({ required: true })
      declare id: number;
      @ApiField({ required: true })
      declare name: string;
      @ApiField({ required: true })
      declare age: number;
      @ApiField({ required: true })
      declare gender: string;
    }

    @ComplexType()
    class Type2 extends PartialType(Type1, ['id', 'name']) {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('type2');
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Type2');
    expect(t1.base).toBeInstanceOf(MappedType);
    expect(t1.getField('id').required).toStrictEqual(false);
    expect(t1.getField('name').required).toStrictEqual(false);
    expect(t1.getField('age').required).toStrictEqual(true);
    expect(t1.getField('gender').required).toStrictEqual(true);
  });

  it('Should PartialType(class) create a new MappedType class', async () => {
    @ComplexType({
      additionalFields: true,
    })
    class Type1 {
      @ApiField({ required: true })
      declare id: number;
      @ApiField({ required: true })
      declare name: string;
      @ApiField({ required: true })
      declare age: number;
      @ApiField({ required: true })
      declare gender: string;
    }

    @ComplexType()
    class Type2 extends PartialType(Type1) {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('type2');
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Type2');
    expect(t1.base).toBeInstanceOf(MappedType);
    expect(t1.getField('id').required).toStrictEqual(false);
    expect(t1.getField('name').required).toStrictEqual(false);
    expect(t1.getField('age').required).toStrictEqual(false);
    expect(t1.getField('gender').required).toStrictEqual(false);
  });

  it('Should PartialType(name, keys) create a new MappedType class', async () => {
    @ComplexType()
    class Type1 {
      @ApiField({ required: true })
      declare field1: number;
      @ApiField({ required: true })
      declare field2: string;
    }

    @ComplexType()
    class Type2 {
      @ApiField({ type: PartialType('type1', ['field1']) })
      declare a: Type1;
      @ApiField({ type: PartialType(Type1, ['field2']) })
      declare b: Type1;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('type2');
    expect(t1).toBeDefined();
    const a = t1.getField('a');
    expect(a.type.kind).toStrictEqual('MappedType');
    expect(a.type.embedded).toEqual(true);
    expect((a.type as MappedType).getField('field1').required).toStrictEqual(
      false,
    );
    expect((a.type as MappedType).getField('field2').required).toStrictEqual(
      true,
    );
    const b = t1.getField('b');
    expect((b.type as MappedType).getField('field1').required).toStrictEqual(
      true,
    );
    expect((b.type as MappedType).getField('field2').required).toStrictEqual(
      false,
    );
  });

  it('Should RequiredType(class, keys) create a new MappedType class', async () => {
    @ComplexType({
      additionalFields: true,
    })
    class Type1 {
      @ApiField()
      declare id: number;
      @ApiField({ required: false })
      declare name: string;
      @ApiField({ required: false })
      declare age: number;
      @ApiField()
      declare gender: string;
    }

    @ComplexType()
    class Type2 extends RequiredType(Type1, ['id', 'name']) {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('type2');
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Type2');
    expect(t1.base).toBeInstanceOf(MappedType);
    expect(t1.getField('id').required).toStrictEqual(true);
    expect(t1.getField('name').required).toStrictEqual(true);
    expect(t1.getField('age').required).toStrictEqual(false);
    expect(t1.getField('gender').required).toStrictEqual(undefined);
  });

  it('Should RequiredType(class) create a new MappedType class', async () => {
    @ComplexType({
      additionalFields: true,
    })
    class Type1 {
      @ApiField()
      declare id: number;
      @ApiField({ required: false })
      declare name: string;
      @ApiField({ required: false })
      declare age: number;
      @ApiField()
      declare gender: string;
    }

    @ComplexType()
    class Type2 extends RequiredType(Type1) {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('type2');
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Type2');
    expect(t1.base).toBeInstanceOf(MappedType);
    expect(t1.getField('id').required).toStrictEqual(true);
    expect(t1.getField('name').required).toStrictEqual(true);
    expect(t1.getField('age').required).toStrictEqual(true);
    expect(t1.getField('gender').required).toStrictEqual(true);
  });

  it('Should RequiredType(name, keys) create a new MappedType class', async () => {
    @ComplexType()
    class Type1 {
      @ApiField({ required: false })
      declare field1: number;
      @ApiField()
      declare field2: string;
    }

    @ComplexType()
    class Type2 {
      @ApiField({ type: RequiredType('type1', ['field1']) })
      declare a: Type1;
      @ApiField({ type: RequiredType(Type1, ['field2']) })
      declare b: Type1;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('type2');
    expect(t1).toBeDefined();
    const a = t1.getField('a');
    expect(a.type.kind).toStrictEqual('MappedType');
    expect(a.type.embedded).toEqual(true);
    expect((a.type as MappedType).getField('field1').required).toStrictEqual(
      true,
    );
    expect((a.type as MappedType).getField('field2').required).toStrictEqual(
      undefined,
    );
    const b = t1.getField('b');
    expect((b.type as MappedType).getField('field1').required).toStrictEqual(
      false,
    );
    expect((b.type as MappedType).getField('field2').required).toStrictEqual(
      true,
    );
  });
});
