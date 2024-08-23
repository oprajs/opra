import { DECORATOR, MixinType } from '@opra/common';
import { Entity } from '@sqb/connect';
import type { Type } from 'ts-gems';

const oldDecorator = MixinType[DECORATOR];
MixinType[DECORATOR] = function (...sources: [Type]) {
  sources = sources.filter(x => typeof x === 'function') as [Type];
  const target = oldDecorator(...sources);
  Entity.mixin(target, ...sources);
  return target;
};
