import { Type } from 'ts-gems';
import { MixinType } from "@opra/common";
import { Entity } from '@sqb/connect';

const _applyMixin = MixinType._applyMixin;
MixinType._applyMixin = function (target: Type, ...sources: [Type]) {
  _applyMixin.call(null, target, ...sources);
  Entity.mixin(target, ...sources);
}
