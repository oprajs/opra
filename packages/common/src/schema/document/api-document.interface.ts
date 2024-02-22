import { StrictOmit } from 'ts-gems';
import { Resource } from '../resource/resource.interface.js';
import { TypeDocument } from './type-document.interface.js';

export interface ApiDocument extends TypeDocument {
  servers?: ServerInfo[];
  root?: StrictOmit<Resource, 'kind'>;
}

export type ServerInfo = {
  url: string;
  description?: string;
}
