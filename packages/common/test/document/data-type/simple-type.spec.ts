/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  ApiDocumentFactory,
  OpraSchema,
} from '@opra/common';

describe('SimpleType', function () {
  let api: ApiDocument;
  const baseArgs: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
    }
  };

  beforeAll(async () => {
    api = await ApiDocumentFactory.createDocument(baseArgs);
  })

  afterAll(() => global.gc && global.gc());

  it('Should exportSchema() return schema', async () => {
    const dt = api.getSimpleType('string');
    expect(dt).toBeDefined();
    const x = dt!.toJSON();
    expect(x).toBeDefined();
    expect(x).toStrictEqual({
      kind: 'SimpleType',
      description: 'A sequence of characters',
      attributes: {
        maxLength: {
          format: "number",
          description: "Minimum number of characters"
        },
        minLength: {
          format: "number",
          description: "Minimum number of characters"
        },
        pattern: {
          format: "string",
          description: "Regex pattern to be used for validation"
        }
      },
    })
  })

});
