import { EnumType } from '@opra/common';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
  UNKNOWN = 'U',
}

EnumType(Gender, {
  name: 'Gender',
  description: 'The gender of a person',
  meanings: {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
    UNKNOWN: 'Unknown',
  },
});
