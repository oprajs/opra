import path from 'node:path';
import {
  ComplexType,
  DataType,
  EnumType,
  MappedType,
  MixinType,
  SimpleType,
} from '@opra/common';
import { CodeBlock } from '../../code-block.js';
import { TsFile } from '../ts-file.js';
import type { TsGenerator } from '../ts-generator';
import { wrapJSDocString } from '../utils/string-utils.js';

const internalTypeNames = [
  'any',
  'boolean',
  'bigint',
  'number',
  'null',
  'string',
  'object',
];

type Intent = 'root' | 'extends' | 'typeDef';

export type generateDataTypeResult =
  | {
      kind: 'internal';
      typeName: string;
    }
  | {
      kind: 'named';
      typeName: string;
      file: TsFile;
    }
  | {
      kind: 'embedded';
      code: string;
    };

export async function generateDataType(
  this: TsGenerator,
  dataType: DataType,
  intent: Intent,
  currentFile?: TsFile,
): Promise<generateDataTypeResult> {
  const doc = dataType.node.getDocument();
  if (doc.id !== this._document?.id) {
    const { generator } = await this.generateDocument(doc);
    return await generator.generateDataType(dataType, intent, currentFile);
  }
  try {
    const typeName = dataType.name;
    if (typeName) {
      if (internalTypeNames.includes(typeName))
        return { kind: 'internal', typeName: dataType.name };
      let file = this._filesMap.get(dataType);
      if (file) {
        if (currentFile) currentFile.addImport(file.filename, [typeName]);
        return { kind: 'named', file, typeName: dataType.name };
      }

      if (dataType instanceof SimpleType)
        file = this.addFile(
          path.join(this._documentRoot, '/simple-types.ts'),
          true,
        );
      else if (dataType instanceof EnumType) {
        file = this.addFile(
          path.join(this._typesRoot, 'enums', typeName + '.ts'),
          true,
        );
      } else
        file = this.addFile(
          path.join(this._typesRoot, 'types', typeName + '.ts'),
          true,
        );
      this._filesMap.set(dataType, file);

      if (file.exportTypes.includes(typeName)) {
        if (currentFile) currentFile.addImport(file.filename, [typeName]);
        return { kind: 'named', file, typeName: dataType.name };
      }
      file.exportTypes.push(typeName);

      const typesIndexTs = this.addFile(
        path.join(this._typesRoot, 'index.ts'),
        true,
      );
      const indexTs = this.addFile('/index.ts', true);
      indexTs.addExport(typesIndexTs.filename, undefined, this._typesNamespace);

      const codeBlock = (file.code['type_' + typeName] = new CodeBlock());
      codeBlock.head = `/**\n * ${wrapJSDocString(dataType.description || '')}\n *`;

      codeBlock.head += `
 * @url ${path.posix.join(doc.url || this.serviceUrl, '$schema', '#types/' + typeName)}
 */
export `;
      codeBlock.typeDef =
        (await this._generateTypeCode(file, dataType, 'root')) + '\n\n';
      typesIndexTs.addExport(file.filename);

      if (currentFile) currentFile.addImport(file.filename, [typeName]);
      return { kind: 'named', file, typeName };
    }

    if (!currentFile)
      throw new TypeError(`You must provide currentFile to generate data type`);
    const code = await this._generateTypeCode(currentFile, dataType, intent);
    return { kind: 'embedded', code };
  } catch (e: any) {
    e.message = `(${dataType.name}) ` + e.message;
    throw e;
  }
}

/**
 *
 */
export async function _generateTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: DataType,
  intent?: Intent,
): Promise<string> {
  if (intent === 'root' && !dataType.name) {
    throw new TypeError(
      `Name required to generate data type code to root intent`,
    );
  }
  if (dataType instanceof EnumType) {
    return await this._generateEnumTypeCode(currentFile, dataType, intent);
  }
  if (dataType instanceof ComplexType) {
    return await this._generateComplexTypeCode(currentFile, dataType, intent);
  }
  if (dataType instanceof SimpleType) {
    return await this._generateSimpleTypeCode(currentFile, dataType, intent);
  }
  if (dataType instanceof MappedType) {
    return await this._generateMappedTypeCode(currentFile, dataType, intent);
  }
  if (dataType instanceof MixinType) {
    return await this._generateMixinTypeCode(currentFile, dataType, intent);
  }
  /* istanbul ignore next */
  throw new TypeError(
    `${dataType.kind} data types can not be directly exported`,
  );
}

/**
 *
 */
export async function _generateEnumTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: EnumType,
  intent?: Intent,
): Promise<string> {
  if (intent === 'root') {
    let out = `enum ${dataType.name} {\n\t`;
    for (const [value, info] of Object.entries(dataType.attributes)) {
      // Print JSDoc
      let jsDoc = '';
      if (dataType.attributes[value].description)
        jsDoc += ` * ${dataType.attributes[value].description}\n`;

      if (jsDoc) out += `/**\n${jsDoc} */\n`;

      out +=
        `${info.alias || value} = ` +
        (typeof value === 'number'
          ? value
          : "'" + String(value).replace("'", "\\'") + "'");
      out += ',\n\n';
    }
    return out + '\b}';
  }

  return (
    '(' +
    Object.keys(dataType.attributes)
      .map(t => `'${t}'`)
      .join(' | ') +
    ')'
  );
}

/**
 *
 */
export async function _generateComplexTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: ComplexType,
  intent?: Intent,
): Promise<string> {
  let out = intent === 'root' ? `interface ${dataType.name} ` : '';

  const ownFields = [...dataType.fields('*')].filter(
    f => f.origin === dataType,
  );

  if (dataType.base) {
    const base = await this.generateDataType(
      dataType.base,
      'extends',
      currentFile,
    );
    let baseDef = base.kind === 'embedded' ? base.code : base.typeName;
    const omitBaseFields = ownFields.filter(f =>
      dataType.base!.findField(f.name),
    );
    if (omitBaseFields.length)
      baseDef = `Omit<${baseDef}, ${omitBaseFields.map(x => "'" + x.name + "'").join(' | ')}>`;

    if (intent === 'root') out += `extends ${baseDef} `;
    else {
      out += baseDef;
      if (!ownFields.length) return out;
      out += ' & ';
    }
  }

  out += '{\n\t';
  let i = 0;
  for (const field of ownFields) {
    if (i++) out += '\n';

    // Print JSDoc
    out += `/**\n * ${field.description || ''}\n`;
    if (field.default) out += ` * @default ` + field.default + '\n';
    // if (field.format)
    //   jsDoc += ` * @format ` + field.format + '\n';
    if (field.exclusive) out += ` * @exclusive\n`;
    if (field.readonly) out += ` * @readonly\n`;
    if (field.writeonly) out += ` * @writeonly\n`;
    if (field.deprecated) {
      out +=
        ` * @deprecated ` +
        (typeof field.deprecated === 'string' ? field.deprecated : '') +
        '\n';
    }
    out += ' */\n';

    // Print field name
    if (field.readonly) out += 'readonly ';
    out += `${field.name}${field.required ? '' : '?'}: `;

    if (field.fixed) {
      const t = typeof field.fixed;
      out += `${t === 'number' || t === 'boolean' || t === 'bigint' ? field.fixed : "'" + field.fixed + "'"}\n`;
    } else {
      const x = await this.generateDataType(field.type, 'typeDef', currentFile);
      const s = x.kind === 'embedded' ? x.code : x.typeName;
      if (field.isArray) {
        out += /[a-zA-Z]\w*/.test(s) ? s + '[]' : '(' + s + ')[]';
      }
    }
  }
  if (dataType.additionalFields) out += '[key: string]: any;\n';
  return out + '\b}';
}

/**
 *
 */
export async function _generateSimpleTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: SimpleType,
  intent?: Intent,
): Promise<string> {
  let out = intent === 'root' ? `type ${dataType.name} = ` : '';
  const nameMapping = dataType.nameMappings.js || 'any';
  out += nameMapping === 'Date' ? 'string' : nameMapping;
  return intent === 'root' ? out + ';' : out;
}

/**
 *
 */
export async function _generateMixinTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: MixinType,
  intent?: Intent,
): Promise<string> {
  const outArray: string[] = [];
  for (const t of dataType.types) {
    const x = await this.generateDataType(t, 'typeDef', currentFile);
    if (x.kind === 'embedded') {
      outArray.push(x.code.includes('|') ? '(' + x.code + ')' : x.code);
    } else outArray.push(x.typeName);
  }
  if (intent === 'root')
    return `type ${dataType.name} = ${outArray.join(' & ')}`;
  if (intent === 'extends') return outArray.join(', ');
  return outArray.join(' & ');
}

/**
 *
 */
export async function _generateMappedTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: MappedType,
  intent?: Intent,
): Promise<string> {
  let out = intent === 'root' ? `type ${dataType.name} = ` : '';

  const base = await this.generateDataType(
    dataType.base,
    'typeDef',
    currentFile,
  );
  const typeDef = base.kind === 'embedded' ? base.code : base.typeName;
  const pick = dataType.pick?.length ? dataType.pick : undefined;
  const omit = !pick && dataType.omit?.length ? dataType.omit : undefined;
  const partial =
    dataType.partial === true ||
    (Array.isArray(dataType.partial) && dataType.partial.length > 0)
      ? dataType.partial
      : undefined;
  const required =
    dataType.required === true ||
    (Array.isArray(dataType.required) && dataType.required.length > 0)
      ? dataType.required
      : undefined;
  if (!(pick || omit || partial || required)) return typeDef;

  if (partial === true) out += 'Partial<';
  else if (partial) {
    out += 'PartialSome<';
    currentFile.addExport('ts-gems', ['PartialSome']);
  }
  if (required === true) out += 'Partial<';
  else if (required) {
    out += 'RequiredSome<';
    currentFile.addExport('ts-gems', ['RequiredSome']);
  }
  if (pick) out += 'Pick<';
  else if (omit) out += 'Omit<';
  out += typeDef;
  if (omit || pick) {
    out +=
      ', ' +
      (omit || pick)!
        .filter(x => !!x)
        .map(x => `'${x}'`)
        .join(' | ') +
      '>';
  }
  if (partial) {
    if (Array.isArray(partial)) {
      out +=
        ', ' +
        partial
          .filter(x => !!x)
          .map(x => `'${x}'`)
          .join(' | ');
    }
    out += '>';
  }
  return out;
}
