import { Type } from 'ts-gems';
import { UnionType } from "@opra/common";
import { Entity } from '@sqb/connect';

const _applyMixin = UnionType._applyMixin;
UnionType._applyMixin = function (target: Type, ...sources: [Type]) {
  _applyMixin.call(null, target, ...sources);
  Entity.mixin(target, ...sources);
}
