import {DynamicModule, ForwardReference, Type} from '@nestjs/common';

export type ModuleThunk = Type | DynamicModule | Promise<DynamicModule> | ForwardReference;
