import { StrictOmit } from 'ts-gems';
import type { Container } from '../resource/container.interface';
import { TypeDocument } from './type-document.interface.js';

export interface ApiDocument extends TypeDocument {
  servers?: ServerInfo[];
  root?: StrictOmit<Container, 'kind'>;
}

export type ServerInfo = {
  url: string;
  description?: string;
}
