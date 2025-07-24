import { ApiDocumentFactory, EnumType, OpraSchema } from '@opra/common';
import { expect } from 'expect';

describe('common:DataTypeFactory - EnumType (Schema)', () => {
  it('Should add EnumType', async () => {
    const GenderEnum: OpraSchema.EnumType = {
      kind: 'EnumType',
      description: 'The gender of a person',
      attributes: {
        M: { alias: 'MALE', description: 'Male person' },
        F: { alias: 'FEMALE', description: 'Female person' },
      },
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: {
        Gender: GenderEnum,
      },
    });
    expect(doc).toBeDefined();
    const t1 = doc.types.get('gender') as EnumType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1.name).toStrictEqual('Gender');
    expect(t1.description).toStrictEqual(GenderEnum.description);
    expect(t1.attributes).toStrictEqual(GenderEnum.attributes);
  });

  it('Should extend EnumType', async () => {
    const Gender: OpraSchema.EnumType = {
      kind: 'EnumType',
      description: 'The gender of a person',
      attributes: {
        M: { alias: 'MALE', description: 'Male person' },
        F: { alias: 'FEMALE', description: 'Female person' },
      },
    };
    const AdministrativeGender: OpraSchema.EnumType = {
      kind: 'EnumType',
      base: 'Gender',
      description: 'The administrative gender of a person',
      attributes: {
        O: { alias: 'OTHER', description: 'Other gender person' },
        U: { alias: 'UNKNOWN', description: 'Unknown gender person' },
      },
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: {
        AdministrativeGender,
        Gender,
      },
    });
    expect(doc).toBeDefined();
    const t1 = doc.types.get('administrativeGender') as EnumType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(t1.name).toStrictEqual('AdministrativeGender');
    expect(t1.description).toStrictEqual(AdministrativeGender.description);
    expect(t1.description).toStrictEqual(AdministrativeGender.description);
    expect(t1.attributes).toStrictEqual({
      ...Gender.attributes,
      ...AdministrativeGender.attributes,
    });
  });
});
