import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants.js';

/**
 * Decorator that marks a controller or method as public.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
