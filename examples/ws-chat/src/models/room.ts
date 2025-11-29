import { ApiField, ComplexType } from '@opra/common';
import { RoomOptions } from './room-options.js';

@ComplexType()
export class Room {
  @ApiField()
  declare name: string;

  @ApiField()
  declare options: RoomOptions;

  @ApiField()
  declare users: number;
}
