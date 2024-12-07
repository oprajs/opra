import path from 'node:path';
import { OpraHttpClient } from '@opra/client';
import { ApiDocument, BUILTIN, HttpApi } from '@opra/common';
import colors from 'ansi-colors';
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
    this.emit(
      'log',
      colors.cyan('Fetching document schema from ') +
        colors.blueBright(this.serviceUrl),
    );
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
    colors.white('[' + document.id + '] ') +
      colors.cyan('Processing document ') +
      colors.magenta(document.info.title || ''),
  );

  if (document.references.size) {
    let refIdGenerator = (options as any)?.refIdGenerator || 1;
    this.emit(
      'log',
      colors.white('[' + document.id + '] ') +
        colors.cyan(`Processing references`),
    );
    for (const ref of document.references.values()) {
      const generator = this.extend();
      generator._document = ref;
      const typesNamespace =
        ref.api?.name ||
        (ref.info.title
          ? pascalCase(ref.info.title)
          : `Reference${refIdGenerator++}`);
      generator._documentRoot = '/references/' + typesNamespace;
      generator._typesRoot = path.join(generator._documentRoot, 'models');
      generator._typesNamespace =
        !this.options.referenceNamespaces || ref[BUILTIN] ? '' : typesNamespace;
      await generator.generateDocument(ref, {
        typesOnly: true,
        refIdGenerator,
      } as any);
    }
  }

  this._fileHeaderDocInfo = `/*
 * ${document.info.title}
 * Id: ${document.id}
 * Version: ${document.info.version}
 * ${this.serviceUrl}
 */`;

  if (document.types.size) {
    this.emit(
      'log',
      colors.white('[' + document.id + ']'),
      colors.cyan(`Processing data types`),
    );
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
