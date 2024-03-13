import type { Service as BaseService } from '../api-document.interface.js';
import type { Resource } from './resource.interface.js';

export interface Service extends BaseService {
  protocol: 'http';
  url?: string;
  root: HttpRoot;
}

/**
 * @interface HttpRoot
 */
export interface HttpRoot extends Pick<Resource, 'endpoints' | 'resources' | 'types'> {
}
