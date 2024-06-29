import { ApiDocumentFactory, EnumType, OpraSchema } from '@opra/common';

describe('DataTypeFactory - EnumType (Class)', () => {
  afterAll(() => global.gc && global.gc());

  it('Should import EnumType', async () => {
    enum Gender {
      MALE = 'M',
      FEMALE = 'F',
    }

    EnumType(Gender, {
      name: 'Gender',
      description: 'The gender of a person',
      meanings: {
        MALE: 'Male person',
        FEMALE: 'Female person',
      },
    });

    const doc = await ApiDocumentFactory.createDocument({
      types: [Gender],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getEnumType('gender');
    expect(t1).toBeDefined();
    expect(t1!.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1!.name).toStrictEqual('Gender');
    expect(t1!.description).toStrictEqual('The gender of a person');
    expect(t1!.attributes).toStrictEqual({
      M: { alias: 'MALE', description: 'Male person' },
      F: { alias: 'FEMALE', description: 'Female person' },
    });
  });

  it('Should add EnumType from array', async () => {
    const Gender = ['M', 'F'] as const;

    EnumType(Gender, {
      name: 'Gender',
      description: 'The gender of a person',
      meanings: {
        M: 'Male person',
        F: 'Female person',
      },
    });

    const doc = await ApiDocumentFactory.createDocument({
      types: [Gender],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getEnumType('gender');
    expect(t1).toBeDefined();
    expect(t1!.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1!.name).toStrictEqual('Gender');
    expect(t1!.description).toStrictEqual('The gender of a person');
    expect(t1!.attributes).toStrictEqual({
      M: { description: 'Male person' },
      F: { description: 'Female person' },
    });
  });

  it('Should extend EnumType', async () => {
    enum Gender {
      MALE = 'M',
      FEMALE = 'F',
    }

    EnumType(Gender, {
      name: 'Gender',
      description: 'The gender of a person',
      meanings: {
        MALE: 'Male person',
        FEMALE: 'Female person',
      },
    });

    enum AdministrativeGender {
      OTHER = 'O',
      UNKNOWN = 'U',
    }

    EnumType(AdministrativeGender, {
      name: 'AdministrativeGender',
      base: Gender,
      description: 'The gender of a person',
      meanings: {
        OTHER: 'Other gender',
        UNKNOWN: 'Unknown gender',
      },
    });

    const doc = await ApiDocumentFactory.createDocument({
      types: [Gender, AdministrativeGender],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getEnumType('gender');
    expect(t1).toBeDefined();
    expect(t1!.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1!.name).toStrictEqual('Gender');
    expect(t1!.description).toStrictEqual('The gender of a person');
    expect(t1!.attributes).toStrictEqual({
      M: { alias: 'MALE', description: 'Male person' },
      F: { alias: 'FEMALE', description: 'Female person' },
    });

    const t2 = doc.node.getEnumType('administrativeGender');
    expect(t2).toBeDefined();
    expect(t2!.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t2!.name).toStrictEqual('AdministrativeGender');
    expect(t2!.description).toStrictEqual('The gender of a person');
    expect(t2!.attributes).toStrictEqual({
      M: { alias: 'MALE', description: 'Male person' },
      F: { alias: 'FEMALE', description: 'Female person' },
      O: { alias: 'OTHER', description: 'Other gender' },
      U: { alias: 'UNKNOWN', description: 'Unknown gender' },
    });
  });
});
