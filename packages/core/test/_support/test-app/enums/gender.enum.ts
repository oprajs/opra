import { EnumType } from '@opra/common';

export enum GenderEnum {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
  UNKNOWN = 'U'
}

EnumType(GenderEnum, {
  name: 'GenderEnum',
  description: 'The gender of a person',
  meanings: {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
    UNKNOWN: 'Unknown'
  }
})
