/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  DocumentFactory,
  OpraSchema,
} from '@opra/common';

describe('SimpleType', function () {
  let api: ApiDocument;
  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
    }
  };

  beforeAll(async () => {
    api = await DocumentFactory.createDocument(baseArgs);
  })

  it('Should exportSchema() return schema', async () => {
    const dt = api.getSimpleType('string');
    const x = dt.exportSchema();
    expect(x).toBeDefined();
    expect(x).toStrictEqual({
      kind: 'SimpleType',
      description: 'A sequence of characters'
    })
  })

});
