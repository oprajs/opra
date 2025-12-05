import { ApiField, ArrayType, ComplexType } from '@opra/common';
import { RoomOptions } from './room-options.js';

@ComplexType()
export class Room {
  @ApiField()
  declare name: string;

  @ApiField()
  declare options: RoomOptions;

  @ApiField({
    type: ArrayType(String),
  })
  declare users: string[];
}
