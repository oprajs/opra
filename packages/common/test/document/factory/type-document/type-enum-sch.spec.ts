/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  EnumType,
  OpraSchema,
} from '@opra/common';

describe('ApiDocumentFactory - EnumType with schema object', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
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
        M: {key: 'MALE', description: 'Male person'},
        F: {key: 'FEMALE', description: 'Female person'}
      }
    }
    const doc = await ApiDocumentFactory.createDocument({
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
  })

  it('Should extend EnumType', async () => {
    const Gender: OpraSchema.EnumType = {
      kind: 'EnumType',
      description: 'The gender of a person',
      values: {
        M: {key: 'MALE', description: 'Male person'},
        F: {key: 'FEMALE', description: 'Female person'}
      }
    }
    const AdministrativeGender: OpraSchema.EnumType = {
      kind: 'EnumType',
      base: 'Gender',
      description: 'The administrative gender of a person',
      values: {
        O: {key: 'OTHER', description: 'Other gender person'},
        U: {key: 'UNKNOWN', description: 'Unknown gender person'}
      }
    }
    const doc = await ApiDocumentFactory.createDocument({
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
    expect(t1.description).toStrictEqual(AdministrativeGender.description);
    expect(t1.values).toStrictEqual({...Gender.values, ...AdministrativeGender.values});
  })

});
