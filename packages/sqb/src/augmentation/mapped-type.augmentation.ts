import { Type } from 'ts-gems';
import { MappedType } from "@opra/common";
import { Entity, EntityMetadata } from '@sqb/connect';

const _applyMixin = MappedType._applyMixin;
MappedType._applyMixin = function (target: Type, source: Type, options) {
  _applyMixin.call(null, target, source, options);
  const srcMeta = Entity.getMetadata(source);
  if (srcMeta) {
    const trgMeta = EntityMetadata.define(target);
    const {isInheritedPredicate} = options;
    EntityMetadata.mixin(trgMeta, srcMeta, k => isInheritedPredicate(k));
  }
}
