/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  EnumType,
  OpraSchema,
} from '@opra/common';

describe('ApiDocumentFactory - EnumType with decorated classes', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should add EnumType', async () => {

    enum Gender {
      MALE = 'M',
      FEMALE = 'F'
    }

    EnumType(Gender, {
      name: 'Gender',
      description: 'The gender of a person',
      meanings: {
        MALE: 'Male person',
        FEMALE: 'Female person'
      }
    });

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Gender]
    })
    expect(doc).toBeDefined();
    const t1 = doc.getEnumType('gender');
    expect(t1).toBeDefined();
    expect(t1!.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1!.name).toStrictEqual('Gender');
    expect(t1!.description).toStrictEqual('The gender of a person');
    expect(t1!.values).toStrictEqual({
      M: {key: 'MALE', description: 'Male person'},
      F: {key: 'FEMALE', description: 'Female person'},
    });
  })

  it('Should add EnumType from array', async () => {

    const Gender = ['M', 'F'] as const;

    EnumType(Gender, {
      name: 'Gender',
      description: 'The gender of a person',
      meanings: {
        M: 'Male person',
        F: 'Female person'
      }
    })

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Gender]
    })
    expect(doc).toBeDefined();
    const t1 = doc.getEnumType('gender');
    expect(t1).toBeDefined();
    expect(t1!.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1!.name).toStrictEqual('Gender');
    expect(t1!.description).toStrictEqual('The gender of a person');
    expect(t1!.values).toStrictEqual({
      M: {description: 'Male person'},
      F: {description: 'Female person'},
    });
  })

  it('Should extend EnumType', async () => {

    enum Gender {
      MALE = 'M',
      FEMALE = 'F'
    }

    EnumType(Gender, {
      name: 'Gender',
      description: 'The gender of a person',
      meanings: {
        MALE: 'Male person',
        FEMALE: 'Female person'
      }
    });

    enum AdministrativeGender {
      OTHER = 'O',
      UNKNOWN = 'U'
    }

    EnumType(AdministrativeGender, {
      name: 'AdministrativeGender',
      base: Gender,
      description: 'The gender of a person',
      meanings: {
        OTHER: 'Other gender',
        UNKNOWN: 'Unknown gender'
      }
    });

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Gender, AdministrativeGender]
    })
    expect(doc).toBeDefined();
    const t1 = doc.getEnumType('gender');
    expect(t1).toBeDefined();
    expect(t1!.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1!.name).toStrictEqual('Gender');
    expect(t1!.description).toStrictEqual('The gender of a person');
    expect(t1!.values).toStrictEqual({
      M: {key: 'MALE', description: 'Male person'},
      F: {key: 'FEMALE', description: 'Female person'},
    });

    const t2 = doc.getEnumType('administrativeGender');
    expect(t2).toBeDefined();
    expect(t2!.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t2!.name).toStrictEqual('AdministrativeGender');
    expect(t2!.description).toStrictEqual('The gender of a person');
    expect(t2!.values).toStrictEqual({
      M: {key: 'MALE', description: 'Male person'},
      F: {key: 'FEMALE', description: 'Female person'},
      O: {key: 'OTHER', description: 'Other gender'},
      U: {key: 'UNKNOWN', description: 'Unknown gender'},
    });
  })

})

