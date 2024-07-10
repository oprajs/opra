import { OpraHttpClient } from '@opra/client';
import { ApiDocument, HttpApi } from '@opra/common';
import chalk from 'chalk';
import path from 'path';
import { pascalCase } from 'putil-varhelpers';
import type { TsGenerator } from '../ts-generator';

export async function generateDocument(
  this: TsGenerator,
  document?: string | ApiDocument,
  options?: {
    typesOnly?: boolean;
  },
): Promise<{
  document: ApiDocument;
  generator: TsGenerator;
}> {
  if (!document || typeof document === 'string') {
    if (document) {
      const out = this._documentsMap.get(document);
      if (out) return out;
    }
    this.emit('log', chalk.cyan('Fetching document schema from ') + chalk.blueBright(this.serviceUrl));
    const client = new OpraHttpClient(this.serviceUrl);
    document = await client.fetchDocument({ documentId: document });
  }
  this._document = document;
  let out = this._documentsMap.get(document.id);
  if (out) return out;
  out = {
    document,
    generator: this,
  };
  this._documentsMap.set(document.id, out);

  this.emit(
    'log',
    chalk.white('[' + document.id + '] ') + chalk.cyan('Processing document ') + chalk.magenta(document.info.title),
  );

  if (document.references.size) {
    this.emit('log', chalk.white('[' + document.id + '] ') + chalk.cyan(`Processing references`));
    for (const ref of document.references.values()) {
      const generator = this.extend();
      generator._document = ref;
      generator._documentRoot = '/references/' + (ref.info.title ? pascalCase(ref.info.title) : ref.id);
      generator._typesRoot = path.join(generator._documentRoot, 'models');
      await generator.generateDocument(ref, { typesOnly: true });
    }
  }

  this._fileHeaderDocInfo = `/*
 * ${document.info.title}
 * Id: ${document.id}
 * Version: ${document.info.version}
 * ${this.serviceUrl}
 */`;

  if (document.types.size) {
    this.emit('log', chalk.white('[' + document.id + ']'), chalk.cyan(`Processing data types`));
    for (const t of document.types.values()) {
      await this.generateDataType(t, 'root');
    }
  }

  if (options?.typesOnly) return out;

  if (document.api instanceof HttpApi) {
    await this.generateHttpApi(document.api);
  }
  return out;
}
