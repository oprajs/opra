import { HttpClient } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { OpraClient, OpraClientOptions } from '@opra/client';
import { OpraClientModuleOptions } from '../module-options.interface.js';
import { createAngularAdapter } from './angular-adapter.js';

const injectionTokens: Record<string, InjectionToken<OpraClient>> = {}

export interface OpraClientOptionsFactory {
  getOptions(name?: string): Promise<OpraClientOptions> | OpraClientOptions;
}

export function createClientOptions(httpClient: HttpClient, options: OpraClientModuleOptions): OpraClientOptions {
  return {...options, adapter: createAngularAdapter(httpClient)};
}

/**
 * This function returns a OpraClient injection token for the given connection name.
 * @param {string | symbol} name
 * This optional parameter is either a OpraClient, or a OpraClientOptions or a string.
 * @returns {string | symbol} The Connection injection token.
 */
export function getClientToken(name?: string) {
  if (!name)
    return OpraClient;
  return injectionTokens[name] || (injectionTokens[name] = new InjectionToken(name));
}
