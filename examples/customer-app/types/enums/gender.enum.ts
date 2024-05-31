import { EnumType } from '@opra/common';

export enum GenderEnum {
  MALE = 'M',
  FEMALE = 'F',
}

EnumType(GenderEnum, {
  name: 'GenderEnum',
  description: 'The gender of a person',
  meanings: {
    MALE: 'Male person',
    FEMALE: 'Female person',
  },
});
