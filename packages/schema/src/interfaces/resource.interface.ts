import { OpraResource } from '../implementation/resource/base-resource.js';

export interface IResource {
  init?(service: OpraResource): void | Promise<void>;
}
