import { DECORATOR, MixinType } from '@opra/common';
import { Entity } from '@sqb/connect';
import type { Type } from 'ts-gems';

const oldDecorator = MixinType[DECORATOR];
MixinType[DECORATOR] = function (...args: any[]) {
  const filteredSources = args[0].filter(x => typeof x === 'function') as [
    Type,
  ];
  const target = oldDecorator(...args);
  Entity.mixin(target, ...filteredSources);
  return target;
};
