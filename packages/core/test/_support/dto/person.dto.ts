import { ComplexType, Property } from '@opra/common';

@ComplexType({
  description: 'Person information'
})
export class Person {

  @Property()
  givenName: string;

  @Property()
  familyName: string;

  @Property()
  gender: string;

  @Property()
  birthDate: string;

}
