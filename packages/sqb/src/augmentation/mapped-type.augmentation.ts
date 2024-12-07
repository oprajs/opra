import { MappedType } from '@opra/common';
import { Entity, EntityMetadata } from '@sqb/connect';
import type { Type } from 'ts-gems';

const _applyMixin = MappedType._applyMixin;
MappedType._applyMixin = function (
  targetType: Type,
  sourceType: Type,
  options,
) {
  _applyMixin.call(null, targetType, sourceType, options);
  const srcMeta = Entity.getMetadata(sourceType);
  if (srcMeta) {
    const trgMeta = EntityMetadata.define(targetType);
    const { isInheritedPredicate } = options;
    EntityMetadata.mixin(trgMeta, srcMeta, k => isInheritedPredicate(k));
  }
};
