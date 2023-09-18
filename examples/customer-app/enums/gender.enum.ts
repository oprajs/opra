import { EnumType } from '@opra/common';

export enum GenderEnum {
  MALE = 'M',
  FEMALE = 'F'
}

EnumType(GenderEnum, {
  name: 'GenderEnum',
  description: 'The gender of a person',
  valueDescriptions: {
    MALE: 'Male person',
    FEMALE: 'Female person'
  }
})
