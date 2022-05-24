import {OwoClientOptions} from './types';

export class OwoClient {
  baseUrl: string;

  constructor(options: OwoClientOptions) {
    this.baseUrl = options.baseUrl;
  }

}
