import 'reflect-metadata';
import { ComplexType, DATATYPE_METADATA, OmitType, PickType } from '@opra/common';
import { Country } from '../../_support/test-api/index.js';

describe('MappedType', function () {

  it('Should OmitType() create MappedType class and define metadata', async function () {

    @ComplexType({description: 'TestClass schema'})
    class TestClass extends OmitType(Country, ['phoneCode']) {
    }

    const base = Object.getPrototypeOf(TestClass);
    const metadata = Reflect.getMetadata(DATATYPE_METADATA, base);
    expect(metadata).toStrictEqual({
      kind: 'MappedType',
      omit: ['phoneCode'],
      type: Country
    });
  })

  it('Should PickType() create MappedType class and define metadata', async function () {

    @ComplexType({description: 'TestClass schema'})
    class TestClass extends PickType(Country, ['phoneCode']) {
    }

    const base = Object.getPrototypeOf(TestClass);
    const metadata = Reflect.getMetadata(DATATYPE_METADATA, base);
    expect(metadata).toStrictEqual({
      kind: 'MappedType',
      pick: ['phoneCode'],
      type: Country
    });
  })

})
