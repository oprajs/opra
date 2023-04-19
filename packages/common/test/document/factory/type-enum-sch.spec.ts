/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DocumentFactory,
  EnumType,
  OpraSchema,
} from '@opra/common';

describe('DocumentFactory - EnumType with schema object', function () {

  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  it('Should add EnumType', async () => {
    const GenderEnum: OpraSchema.EnumType = {
      kind: 'EnumType',
      description: 'The gender of a person',
      values: {
        MALE: 'M',
        FEMALE: 'F'
      },
      meanings: {
        MALE: 'Male person',
        FEMALE: 'Female person'
      }
    }
    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: {
        Gender: GenderEnum
      }
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('gender') as EnumType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1.name).toStrictEqual('Gender');
    expect(t1.description).toStrictEqual(GenderEnum.description);
    expect(t1.values).toStrictEqual(GenderEnum.values);
    expect(t1.meanings).toStrictEqual(GenderEnum.meanings);
  })

  it('Should extend EnumType', async () => {
    const Gender: OpraSchema.EnumType = {
      kind: 'EnumType',
      description: 'The gender of a person',
      values: {
        MALE: 'M',
        FEMALE: 'F'
      },
      meanings: {
        MALE: 'Male person',
        FEMALE: 'Female person'
      }
    }
    const AdministrativeGender: OpraSchema.EnumType = {
      kind: 'EnumType',
      base: 'Gender',
      description: 'The administrative gender of a person',
      values: {
        OTHER: 'O',
        UNKNOWN: 'U'
      },
      meanings: {
        OTHER: 'Other gender person',
        UNKNOWN: 'Unknown gender person'
      }
    }
    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: {
        AdministrativeGender,
        Gender,
      }
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('administrativeGender') as EnumType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1.name).toStrictEqual('AdministrativeGender');
    expect(t1.description).toStrictEqual(AdministrativeGender.description);
    expect(t1.values).toStrictEqual({...Gender.values, ...AdministrativeGender.values});
    expect(t1.meanings).toStrictEqual({...Gender.meanings, ...AdministrativeGender.meanings});
  })

});
