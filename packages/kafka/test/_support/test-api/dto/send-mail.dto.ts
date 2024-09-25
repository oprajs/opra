import { ApiField, ComplexType } from '@opra/common';

@ComplexType({
  description: 'Send Mail DTO',
})
export class SendMailDto {
  @ApiField()
  declare from: string;

  @ApiField()
  declare to: string;

  @ApiField()
  declare message: string;
}
