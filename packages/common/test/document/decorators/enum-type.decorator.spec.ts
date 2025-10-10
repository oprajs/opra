import 'reflect-metadata';
import { DATATYPE_METADATA, EnumType } from '@opra/common';
import { expect } from 'expect';

describe('common:EnumType() decorator', () => {
  it('Should define EnumType metadata', async () => {
    enum TestEnum {
      A = 1,
      B = 2,
      C = 3,
    }
    EnumType(TestEnum, {
      name: 'TestEnum',
      description: 'Custom enum',
      meanings: {
        A: 'A',
        B: 'B',
        C: 'C',
      },
    });

    const metadata = TestEnum[DATATYPE_METADATA];
    expect(metadata).toEqual({
      kind: 'EnumType',
      name: 'TestEnum',
      description: 'Custom enum',
      attributes: {
        '1': {
          alias: 'A',
          description: 'A',
        },
        '2': {
          alias: 'B',
          description: 'B',
        },
        '3': {
          alias: 'C',
          description: 'C',
        },
      },
    });
  });
});
