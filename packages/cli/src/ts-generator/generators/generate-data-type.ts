import path from 'node:path';
import {
  ArrayType,
  ComplexType,
  DataType,
  EnumType,
  MappedType,
  MixinType,
  SimpleType,
  UnionType,
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
      codeBlock.header_start = `/**\n`;
      codeBlock.header = ` * ${wrapJSDocString(dataType.description || '')}\n`;
      codeBlock.header += ` * @url ${path.posix.join(doc.url || this.serviceUrl, '$schema', '#types/' + typeName)}\n`;
      codeBlock.header_end = `*/\n`;
      codeBlock.type_start = `export `;
      await this._generateTypeCode(file, dataType, codeBlock, 'root');
      codeBlock.type_end = '\n\n';
      typesIndexTs.addExport(file.filename);

      if (currentFile) currentFile.addImport(file.filename, [typeName]);
      return { kind: 'named', file, typeName };
    }

    if (!currentFile)
      throw new TypeError(`You must provide currentFile to generate data type`);
    const codeBlock = new CodeBlock();
    await this._generateTypeCode(currentFile, dataType, codeBlock, intent);
    return { kind: 'embedded', code: codeBlock.toString() };
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
  codeBlock: CodeBlock,
  intent?: Intent,
): Promise<void> {
  if (intent === 'root' && !dataType.name) {
    throw new TypeError(
      `Name required to generate data type code to root intent`,
    );
  }
  if (dataType instanceof ArrayType) {
    await this._generateArrayTypeCode(currentFile, dataType, codeBlock, intent);
    return;
  }
  if (dataType instanceof ComplexType) {
    await this._generateComplexTypeCode(
      currentFile,
      dataType,
      codeBlock,
      intent,
    );
    return;
  }
  if (dataType instanceof EnumType) {
    return await this._generateEnumTypeCode(
      currentFile,
      dataType,
      codeBlock,
      intent,
    );
  }
  if (dataType instanceof MappedType) {
    return await this._generateMappedTypeCode(
      currentFile,
      dataType,
      codeBlock,
      intent,
    );
  }
  if (dataType instanceof MixinType) {
    return await this._generateMixinTypeCode(
      currentFile,
      dataType,
      codeBlock,
      intent,
    );
  }
  if (dataType instanceof SimpleType) {
    return await this._generateSimpleTypeCode(
      currentFile,
      dataType,
      codeBlock,
      intent,
    );
  }
  if (dataType instanceof UnionType) {
    return await this._generateUnionTypeCode(
      currentFile,
      dataType,
      codeBlock,
      intent,
    );
  }
  /* istanbul ignore next */
  throw new TypeError(
    `${dataType.kind} data types can not be directly exported`,
  );
}

/**
 *
 */
export async function _generateArrayTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: ArrayType,
  codeBlock: CodeBlock,
  intent?: Intent,
): Promise<void> {
  if (intent === 'extends')
    throw new TypeError('Array types can not be extended');
  let out = '';
  const x = await this.generateDataType(dataType.type, 'typeDef', currentFile);
  if (x.kind === 'embedded') {
    out =
      x.code.includes('|') || x.code.includes('&')
        ? '(' + x.code + ')'
        : x.code;
  } else out = x.typeName;
  codeBlock.typeDef =
    intent === 'root' ? `type ${dataType.name} = ${out}[]` : `${out}[]`;
}

/**
 *
 */
export async function _generateComplexTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: ComplexType,
  codeBlock: CodeBlock,
  intent?: Intent,
): Promise<void> {
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
      if (!ownFields.length) {
        codeBlock.typeDef = out;
        return;
      }
      out += ' & ';
    }
  }

  out += '{\n\t';
  let i = 0;
  for (const field of ownFields) {
    const fieldCode = new CodeBlock();
    if (i++) out += '\n';

    // Print JSDoc
    fieldCode.header_start = '/**\n';
    fieldCode.header = '';
    if (field.description)
      fieldCode.header += ` * ${wrapJSDocString(field.description)}\n`;
    fieldCode.header_attr = '';
    if (field.default)
      fieldCode.header_attr += ` * @default ` + field.default + '\n';
    // if (field.format)
    //   jsDoc += ` * @format ` + field.format + '\n';
    if (field.exclusive) fieldCode.header_attr += ` * @exclusive\n`;
    if (field.readonly) fieldCode.header_attr += ` * @readonly\n`;
    if (field.writeonly) fieldCode.header_attr += ` * @writeonly\n`;
    if (field.deprecated) {
      fieldCode.header_attr +=
        ` * @deprecated ` +
        (typeof field.deprecated === 'string' ? field.deprecated : '') +
        '\n';
    }
    fieldCode.header_end = ' */\n';

    if (field.type instanceof SimpleType && field.type.properties) {
      let s = '';
      for (const [k, v] of Object.entries(field.type.properties)) {
        if (v != null) s += ` *   ${k}: ${v}\n`;
      }
      if (s) fieldCode.header += ' * Attributes:\n' + s;
    }

    // Print field name
    fieldCode.def = '';
    if (field.readonly) fieldCode.def += 'readonly ';
    fieldCode.def += `${field.name}${field.required ? '' : '?'}: `;

    let typ = '';
    if (field.fixed) {
      const t = typeof field.fixed;
      typ = `${t === 'number' || t === 'boolean' || t === 'bigint' ? field.fixed : "'" + field.fixed + "'"}\n`;
    } else {
      const x = await this.generateDataType(field.type, 'typeDef', currentFile);
      typ = x.kind === 'embedded' ? x.code : x.typeName;
    }
    if (field.isArray && !(field.type instanceof ArrayType)) {
      fieldCode.def += /[a-zA-Z]\w*/.test(typ)
        ? typ + '[];\n'
        : '(' + typ + ')[];\n';
    } else fieldCode.def += typ + ';\n';
    out += fieldCode.toString();
  }
  if (dataType.additionalFields) out += '[key: string]: any;\n';
  codeBlock.typeDef = out + '\b}';
}

/**
 *
 */
export async function _generateEnumTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: EnumType,
  codeBlock: CodeBlock,
  intent?: Intent,
): Promise<void> {
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
    codeBlock.typeDef = out + '\b}';
    return;
  }

  codeBlock.typeDef =
    '(' +
    Object.keys(dataType.attributes)
      .map(t => `'${t}'`)
      .join(' | ') +
    ')';
}

/**
 *
 */
export async function _generateMappedTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: MappedType,
  codeBlock: CodeBlock,
  intent?: Intent,
): Promise<void> {
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
  if (!(pick || omit || partial || required)) {
    codeBlock.typeDef = typeDef;
    return;
  }

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
  codeBlock.typeDef = out;
}

/**
 *
 */
export async function _generateMixinTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: MixinType,
  codeBlock: CodeBlock,
  intent?: Intent,
): Promise<void> {
  const outArray: string[] = [];
  for (const t of dataType.types) {
    const x = await this.generateDataType(t, 'typeDef', currentFile);
    if (x.kind === 'embedded') {
      outArray.push(
        x.code.includes('|') || x.code.includes('&')
          ? '(' + x.code + ')'
          : x.code,
      );
    } else outArray.push(x.typeName);
  }
  if (intent === 'root') {
    codeBlock.typeDef = `type ${dataType.name} = ${outArray.join(' & ')}`;
  } else if (intent === 'extends') {
    codeBlock.typeDef = outArray.join(', ');
  } else codeBlock.typeDef = outArray.join(' & ');
}

/**
 *
 */
export async function _generateSimpleTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: SimpleType,
  codeBlock: CodeBlock,
  intent?: Intent,
): Promise<void> {
  let s = '';
  if (dataType.properties) {
    for (const [k, v] of Object.entries(dataType.properties)) {
      if (v != null) s += ` *   ${k}: ${v}\n`;
    }
    if (s) codeBlock.header += ' * Attributes:\n' + s;
  }

  let out = intent === 'root' ? `type ${dataType.name} = ` : '';
  const nameMapping = dataType.nameMappings.js || 'any';
  out += nameMapping === 'Date' ? 'string' : nameMapping;
  codeBlock.typeDef = intent === 'root' ? out + ';' : out;
}

/**
 *
 */
export async function _generateUnionTypeCode(
  this: TsGenerator,
  currentFile: TsFile,
  dataType: UnionType,
  codeBlock: CodeBlock,
  intent?: Intent,
): Promise<void> {
  if (intent === 'extends')
    throw new TypeError('Union types can not be extended');
  const outArray: string[] = [];
  for (const t of dataType.types) {
    const x = await this.generateDataType(t, 'typeDef', currentFile);
    if (x.kind === 'embedded') {
      outArray.push(
        x.code.includes('|') || x.code.includes('&')
          ? '(' + x.code + ')'
          : x.code,
      );
    } else outArray.push(x.typeName);
  }
  if (intent === 'root')
    codeBlock.typeDef = `type ${dataType.name} = ${outArray.join(' | ')}`;
  else codeBlock.typeDef = outArray.join(' | ');
}
