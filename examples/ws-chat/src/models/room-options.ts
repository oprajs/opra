import { ApiField, ComplexType, EnumType } from '@opra/common';

export enum RoomVisibility {
  public = 'public',
  private = 'private',
}

EnumType(RoomVisibility, {
  name: 'RoomVisibility',
  description: 'Room visibility',
});

@ComplexType()
export class RoomOptions {
  @ApiField({
    default: RoomVisibility.public,
  })
  visibility: RoomVisibility = RoomVisibility.public;

  @ApiField({
    required: false,
  })
  maxUsers?: number;
}
