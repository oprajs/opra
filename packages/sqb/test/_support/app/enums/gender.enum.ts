import { EnumType } from '@opra/common';

export enum Gender {
  'M' = 'M',
  'F' = 'F',
  'O' = 'O',
  'U' = 'U'
}

EnumType(Gender, {
  name: 'Gender',
  meanings: {
    M: 'Male',
    F: 'Female',
    O: 'Other',
    U: 'Unknown'
  }
})
