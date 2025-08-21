import { ApiField, ComplexType } from '@opra/common';

@ComplexType({
  description: 'Send Mail DTO',
})
export class SendMailDto {
  @ApiField()
  declare from: string;

  @ApiField()
  declare target: string;

  @ApiField()
  declare message: string;
}
