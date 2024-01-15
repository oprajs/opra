import path from 'node:path';
import {
  ComplexType, DataType, EnumType,
  MappedType, MixinType, SimpleType
} from '@opra/common';
import { wrapJSDocString } from '../utils/string-utils.js';
import type { ApiExporter } from './api-exporter.js';
import { TsFile } from './ts-file.js';

const internalTypeNames = ['any', 'boolean', 'bigint', 'number', 'null', 'string', 'object'];

type Intent = 'scope' | 'extends' | 'field';

/**
 *
 */
export async function processTypes(this: ApiExporter) {
  const {document} = this;
  for (const dataType of document.types.values()) {
    await this.generateTypeFile(dataType);
  }
}

/**
 *
 * @param dataType
 */
export async function generateTypeFile(
    this: ApiExporter,
    dataType: DataType
): Promise<TsFile | undefined> {
  const typeName = dataType.name;
  if (typeName === 'any')
    return;
  if (!typeName)
    throw new TypeError(`DataType has no name`);

  const typesTs = this.addFile('/types.ts', true);

  let filePath = '';
  if (dataType instanceof SimpleType)
    filePath = '/simple-types.ts';
  else {
    if (dataType instanceof EnumType)
      filePath = path.join('/enums', typeName + '.ts');
    else
      filePath = path.join('/types', typeName + '.ts');
  }
  const file = this.addFile(filePath, true);

  if (file.exportTypes.includes(typeName))
    return file;
  file.exportTypes.push(typeName);

  const indexTs = this.addFile('/index.ts', true);
  indexTs.addExport(file.filename);

  file.content += `
/**
 * ${typeName}`;

  if (dataType.description)
    file.content += `
 * ${wrapJSDocString(dataType.description || '')}`;

  file.content += `
 * @url ${path.posix.join(this.client.serviceUrl, '#types/' + typeName)}
 */
export `;

  if (dataType instanceof EnumType)
    file.content += await this.generateEnumTypeDefinition({file, dataType, intent: 'scope'});
  else if (dataType instanceof ComplexType)
    file.content += await this.generateComplexTypeDefinition({file, dataType, intent: 'scope'});
  else if (dataType instanceof SimpleType)
    file.content += await this.generateSimpleTypeDefinition({file, dataType, intent: 'scope'});
  else
    throw new TypeError(`${dataType.kind} data type (${typeName}) can not be directly exported`);

  file.content += '\n';

  typesTs.addExport(file.filename);
  return file;
}


/**
 *
 */
export async function resolveTypeNameOrDef(
    this: ApiExporter,
    args: {
      file: TsFile,
      dataType: DataType,
      intent: Intent
    }
): Promise<string> {
  const {intent, dataType} = args;
  if (dataType.name && !dataType.isEmbedded) {
    if (internalTypeNames.includes(dataType.name))
      return dataType.name;
    const f = await this.generateTypeFile(dataType);
    if (!f)
      return '';
    args.file.addImport(f.filename, [dataType.name], true);
    return dataType.name;
  }
  if (dataType instanceof SimpleType)
    return this.generateSimpleTypeDefinition({...args, dataType});
  if (dataType instanceof EnumType)
    return this.generateEnumTypeDefinition({...args, dataType});
  if (dataType instanceof MixinType)
    return this.generateMixinTypeDefinition({...args, dataType});
  if (dataType instanceof MappedType)
    return this.generateMappedTypeDefinition({...args, dataType});
  if (dataType instanceof ComplexType)
    return this.generateComplexTypeDefinition({...args, dataType});
  return '';
}

/**
 *
 */
export async function generateEnumTypeDefinition(
    this: ApiExporter,
    args: {
      file: TsFile,
      dataType: EnumType,
      intent: Intent
    }
): Promise<string> {
  const {dataType} = args;

  if (args.intent === 'field')
    return '(' +
        Object.keys(dataType.values)
            .map(t => `'${t}'`)
            .join(' | ') +
        ')';

  if (args.intent !== 'scope')
    throw new TypeError(`Can't generate EnumType for "${args.intent}" intent`);

  if (!dataType.name)
    throw new TypeError(`Name required to generate EnumType for "${args.intent}" intent`);

  let out = `enum ${dataType.name} {\n\t`;
  for (const [value, info] of Object.entries(dataType.values)) {

    // Print JSDoc
    let jsDoc = '';
    if (dataType.values[value].description)
      jsDoc += ` * ${dataType.values[value].description}\n`;

    if (jsDoc)
      out += `/**\n${jsDoc} */\n`;

    out += `${info.key || value} = ` +
        (typeof value === 'number' ? value : ('\'' + (String(value)).replace('\'', '\\\'')) + '\'')
    out += ',\n\n';
  }
  return out + '\b}';
}

/**
 *
 */
export async function generateComplexTypeDefinition(
    this: ApiExporter,
    args: {
      file: TsFile,
      dataType: ComplexType,
      intent: Intent
    }
): Promise<string> {
  const {intent, dataType} = args;

  if (intent === 'scope' && !dataType.name)
    throw new TypeError(`Name required to generate ComplexType for "${args.intent}" intent`);

  let out = intent === 'scope' ? `interface ${dataType.name} ` : '';

  if (dataType.base) {
    const base = await this.resolveTypeNameOrDef({file: args.file, dataType: dataType.base, intent: 'extends'});
    const omitFields = [...dataType.own.fields.keys()]
        .filter(k => dataType.base?.fields.has(k));
    const baseDef = omitFields.length
        ? `Omit<${base}, ${omitFields.map(x => "'" + x + "'").join(' | ')}>`
        : `${base}`;
    if (intent === 'scope')
      out += `extends ${baseDef} `;
    else {
      out += baseDef;
      if (!dataType.own.fields.size)
        return out;
      out += ' & ';
    }

  }

  out += '{\n\t';
  let i = 0;
  for (const field of dataType.own.fields.values()) {
    if (i++) out += '\n';

    // Print JSDoc
    out += `/**\n * ${field.description || ''}\n`;
    if (field.default)
      out += ` * @default ` + field.default + '\n';
    // if (field.format)
    //   jsDoc += ` * @format ` + field.format + '\n';
    if (field.exclusive)
      out += ` * @exclusive\n`;
    if (field.readonly)
      out += ` * @readonly\n`;
    if (field.writeonly)
      out += ` * @writeonly\n`;
    if (field.deprecated)
      out += ` * @deprecated ` + (typeof field.deprecated === 'string' ? field.deprecated : '') + '\n';
    out += ' */\n';

    // Print field name
    if (field.readonly) out += 'readonly ';
    out += `${field.name}${field.required ? '' : '?'}: `;

    if (field.fixed) {
      const t = typeof field.fixed;
      out += `${t === 'number' || t === 'boolean' || t === 'bigint' ? field.fixed : "'" + field.fixed + "'"}\n`;
    } else {
      out += await this.resolveTypeNameOrDef({file: args.file, dataType: field.type, intent: 'field'}) +
          `${field.isArray ? '[]' : ''};\n`;
    }
  }
  if (dataType.additionalFields)
    out += '[key: string]: any;\n';
  return out + '\b}';
}


/**
 *
 */
export async function generateSimpleTypeDefinition(
    this: ApiExporter,
    args: {
      file: TsFile,
      dataType: SimpleType,
      intent: Intent
    }
): Promise<string> {
  const {intent, dataType} = args;

  if (intent === 'scope' && !dataType.name)
    throw new TypeError(`Name required to generate SimpleType for "${args.intent}" intent`);

  let out = intent === 'scope' ? `type ${dataType.name} = ` : '';

  if (dataType.extendsFrom('boolean'))
    out += 'boolean';
  else if (dataType.extendsFrom('string'))
    out += 'string';
  else if (dataType.extendsFrom('number') || dataType.extendsFrom('integer'))
    out += 'number';
  else if (dataType.extendsFrom('date') || dataType.extendsFrom('datetime'))
    out += 'Date';
  else if (dataType.extendsFrom('approxdate') || dataType.extendsFrom('approxdatetime'))
    out += 'string';
  else if (dataType.extendsFrom('bigint'))
    out += 'bigint';
  else if (dataType.extendsFrom('object'))
    out += 'object';
  else
    out += 'any';
  return intent === 'scope' ? out + ';' : out;
}


/**
 *
 */
export async function generateMixinTypeDefinition(
    this: ApiExporter,
    args: {
      file: TsFile,
      dataType: MixinType,
      intent: Intent
    }
): Promise<string> {
  const {file, dataType, intent} = args;
  return (await Promise.all(
      dataType.types
          .map(t => this.resolveTypeNameOrDef({file, dataType: t, intent}))
  )).map(t => t.includes('|') ? '(' + t + ')' : t)
      .join(intent === 'extends' ? ', ' : ' & ');
}

/**
 *
 */
export async function generateMappedTypeDefinition(
    this: ApiExporter,
    args: {
      file: TsFile,
      dataType: MappedType,
      intent: Intent
    }
): Promise<string> {
  const {file, dataType, intent} = args;

  const typeDef = await this.resolveTypeNameOrDef({...args, dataType: dataType.base});
  const pick = dataType.pick?.length ? dataType.pick : undefined;
  const omit = !pick && dataType.omit?.length ? dataType.omit : undefined;
  const partial =
      dataType.partial === true || Array.isArray(dataType.partial) && dataType.partial.length > 0
          ? dataType.partial
          : undefined;
  if (!(pick || omit || partial))
    return typeDef;
  let out = '';
  if (partial)
    out += 'Partial<';
  if (pick)
    out += 'Pick<';
  else if (omit)
    out += 'Omit<';
  out += typeDef;
  if (omit || pick)
    out += ', ' + (omit || pick)!
            .filter(x => !!x)
            .map(x => `'${x}'`)
            .join(' | ') +
        '>';
  if (partial) {
    if (Array.isArray(partial))
      out += ', ' + partial
          .filter(x => !!x)
          .map(x => `'${x}'`)
          .join(' | ');
    out += '>';
  }
  return out;
}

