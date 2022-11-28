import { Inject } from '@angular/core';
import { getClientToken } from '../imp/utils.js';

export const InjectOpraClient: (name?: string) =>
    ParameterDecorator = (name?: string) =>
    Inject(getClientToken(name));
