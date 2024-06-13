import { Type } from 'ts-gems';
import { DECORATOR, MixinType } from '@opra/common';
import { Entity } from '@sqb/connect';

const oldDecorator = MixinType[DECORATOR];
MixinType[DECORATOR] = function (...sources: [Type]) {
  sources = sources.filter(x => typeof x === 'function') as [Type];
  const target = oldDecorator(...sources);
  Entity.mixin(target, ...sources);
  return target;
};
