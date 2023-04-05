/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '@opra/sqb'
import {
  DocumentFactory,
  EnumType,
  OpraSchema
} from '@opra/common';

describe('DocumentFactory - EnumType with decorated classes', function () {

  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };


  it('Should add EnumType', async () => {

    enum Gender {
      MALE = 'M',
      FEMALE = 'F'
    }

    const GenderOptions: EnumType.Options<typeof Gender> = {
      name: 'Gender',
      description: 'The gender of a person',
      meanings: {
        MALE: 'Male person',
        FEMALE: 'Female person'
      }
    }

    EnumType(Gender, GenderOptions);

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Gender]
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('gender') as EnumType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1.name).toStrictEqual('Gender');
    expect(t1.description).toStrictEqual(GenderOptions.description);
    expect(t1.values).toStrictEqual(Gender);
    expect(t1.meanings).toStrictEqual(GenderOptions.meanings);
  })

  it('Should add EnumType from array', async () => {

    const Gender = ['M', 'F'] as const;

    const GenderOptions: EnumType.Options<typeof Gender> = {
      name: 'Gender',
      description: 'The gender of a person',
      meanings: {
        M: 'Male person',
        F: 'Female person'
      }
    }

    EnumType(Gender, GenderOptions)

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Gender]
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('gender') as EnumType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1.name).toStrictEqual('Gender');
    expect(t1.description).toStrictEqual(GenderOptions.description);
    expect(t1.values).toStrictEqual({M: 'M', F: 'F'});
    expect(t1.meanings).toStrictEqual(GenderOptions.meanings);
  })

  it('Should extend EnumType', async () => {

    enum Gender {
      MALE = 'M',
      FEMALE = 'F'
    }

    const GenderOptions: EnumType.Options<typeof Gender> = {
      name: 'Gender',
      description: 'The gender of a person',
      meanings: {
        MALE: 'Male person',
        FEMALE: 'Female person'
      }
    }

    EnumType(Gender, GenderOptions);

    enum AdministrativeGender {
      OTHER = 'O',
      UNKNOWN = 'U'
    }

    const AdministrativeGenderOptions: EnumType.Options<typeof AdministrativeGender> = {
      name: 'AdministrativeGender',
      base: Gender,
      description: 'The gender of a person',
      meanings: {
        OTHER: 'Other gender person',
        UNKNOWN: 'Unknown gender person'
      }
    }

    EnumType(AdministrativeGender, AdministrativeGenderOptions);

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [AdministrativeGender]
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('gender') as EnumType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1.name).toStrictEqual('Gender');
    expect(t1.description).toStrictEqual(GenderOptions.description);
    expect(t1.values).toStrictEqual(Gender);
    expect(t1.meanings).toStrictEqual(GenderOptions.meanings);

    const t2 = doc.types.get('administrativeGender') as EnumType;
    expect(t2).toBeDefined();
    expect(t2.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t2.name).toStrictEqual('AdministrativeGender');
    expect(t2.description).toStrictEqual(AdministrativeGenderOptions.description);
    expect(t2.values).toStrictEqual({...Gender, ...AdministrativeGender});
    expect(t2.meanings).toStrictEqual({...GenderOptions.meanings, ...AdministrativeGenderOptions.meanings});
  })

})

