import path from 'node:path';
import { ComplexType, DataType, EnumType, MappedType, SimpleType, UnionType } from '@opra/common';
import { wrapJSDocString } from '../utils/string-utils.js';
import type { ApiExporter } from './api-exporter.js';
import { TsFile } from './ts-file.js';

const internalTypeNames = ['any', 'boolean', 'bigint', 'number', 'null', 'string'];

/**
 *
 * @param targetDir
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
 * @param targetDir
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

  // Export EnumType
  if (dataType instanceof EnumType) {
    file.content += `
/**\n * ${wrapJSDocString(dataType.description || '')}
 * @enum ${typeName}
 * @url ${path.posix.join(this.client.serviceUrl, '#types/' + typeName)}
 */
export enum ${typeName} ` + await this.generateEnumTypeDefinition(file, dataType);
  }

  // Export ComplexType
  if (dataType instanceof ComplexType) {
    file.content += `
/**\n * ${wrapJSDocString(dataType.description || '')}
 * @interface ${typeName}
 * @url ${path.posix.join(this.client.serviceUrl, '#types/' + typeName)}
 */
export interface ${typeName} ${await this.generateComplexTypeDefinition(file, dataType, true)}`
  }

  // Export SimpleType
  if (dataType instanceof SimpleType) {

    file.content += `
/**\n * ${wrapJSDocString(dataType.description || '')}
 * @interface ${typeName}
 * @url ${path.posix.join(this.client.serviceUrl, '#types/' + typeName)}
 */
export type ${typeName} = ` + await this.generateSimpleTypeDefinition(file, dataType);
  }

  typesTs.addExport(file.filename);
  return file;
}

/**
 *
 * @param file
 * @param dataType
 * @param forInterface
 */
export async function resolveTypeNameOrDef(
    this: ApiExporter,
    file: TsFile,
    dataType: DataType,
    forInterface?: boolean
): Promise<string> {
  if (dataType.name) {
    if (internalTypeNames.includes(dataType.name))
      return dataType.name;
    const f = await this.generateTypeFile(dataType);
    if (!f)
      return '';
    file.addImport(f.filename, [dataType.name], true);
    return dataType.name;
  }
  if (dataType instanceof SimpleType)
    return this.generateSimpleTypeDefinition(file, dataType);
  if (dataType instanceof EnumType)
    return this.generateEnumTypeDefinition(file, dataType);
  if (dataType instanceof UnionType)
    return this.generateUnionTypeDefinition(file, dataType, forInterface);
  if (dataType instanceof MappedType)
    return this.generateMappedTypeDefinition(file, dataType, forInterface);
  if (dataType instanceof ComplexType)
    return this.generateComplexTypeDefinition(file, dataType, forInterface);
  return '';
}

/**
 *
 * @param file
 * @param dataType
 * @param forInterface
 */
export async function generateComplexTypeDefinition(
    this: ApiExporter,
    file: TsFile,
    dataType: ComplexType,
    forInterface?: boolean
): Promise<string> {
  let out = '';
  if (dataType.base) {
    const base = await this.resolveTypeNameOrDef(file, dataType.base, forInterface);
    out += forInterface ? `extends ${base} ` : `${base} & `;
  }

  out += '{\n\n\t';
  for (const field of dataType.own.fields.values()) {

    // Print JSDoc
    let jsDoc = '';
    if (field.description)
      jsDoc += ` * ${field.description}\n`;
    if (field.type.name)
      jsDoc += ` * @type ${field.type.name}\n`;
    if (field.default)
      jsDoc += ` * @default ` + field.default + '\n';
    // if (field.format)
    //   jsDoc += ` * @format ` + field.format + '\n';
    if (field.exclusive)
      jsDoc += ` * @exclusive\n`;
    if (field.readonly)
      jsDoc += ` * @readonly\n`;
    if (field.writeonly)
      jsDoc += ` * @writeonly\n`;
    if (field.deprecated)
      jsDoc += ` * @deprecated ` + (typeof field.deprecated === 'string' ? field.deprecated : '') + '\n';

    if (jsDoc)
      out += `/**\n${jsDoc} */\n`;

    // Print field name
    if (field.readonly) out += 'readonly ';
    out += `${field.name}${field.required ? '' : '?'}: `;

    if (field.fixed)
      out += `${field.fixed}`;
    else {
      out += await this.resolveTypeNameOrDef(file, field.type) +
          `${field.isArray ? '[]' : ''};\n\n`;
    }
  }
  if (dataType.additionalFields)
    out += '[key: string]: any;\n';
  return out + '\b}';
}


/**
 *
 * @param file
 * @param dataType
 */
export async function generateSimpleTypeDefinition(
    this: ApiExporter,
    file: TsFile,
    dataType: SimpleType
): Promise<string> {
  if (dataType.extendsFrom('boolean'))
    return 'boolean';
  if (dataType.extendsFrom('string'))
    return 'string';
  if (dataType.extendsFrom('number') || dataType.extendsFrom('integer'))
    return 'number';
  if (dataType.extendsFrom('timestamp') || dataType.extendsFrom('date'))
    return 'Date';
  if (dataType.extendsFrom('bigint'))
    return 'bigint';
  if (dataType.extendsFrom('object'))
    return 'object';
  return 'any';
}

/**
 *
 * @param file
 * @param dataType
 */
export async function generateEnumTypeDefinition(
    this: ApiExporter,
    file: TsFile,
    dataType: EnumType
): Promise<string> {
  let out = '{\n\t';
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
 * @param file
 * @param dataType
 * @param forInterface
 */
export async function generateUnionTypeDefinition(
    this: ApiExporter,
    file: TsFile,
    dataType: UnionType,
    forInterface?: boolean
): Promise<string> {
  // let out = '';
  return (await Promise.all(
      dataType.types
          .map(t => this.resolveTypeNameOrDef(file, t, forInterface))
  )).join(forInterface ? ', ' : ' & ');
}

/**
 *
 * @param file
 * @param dataType
 * @param forInterface
 */
export async function generateMappedTypeDefinition(
    this: ApiExporter,
    file: TsFile,
    dataType: MappedType,
    forInterface?: boolean
): Promise<string> {
  const typeName = await this.resolveTypeNameOrDef(file, dataType.base, forInterface);
  const keys = (dataType.pick || dataType.omit || []);
  if (!keys.length)
    return typeName;
  return `${dataType.pick ? 'Pick<' : 'Omit<'}${typeName}, ${keys.map(x => `'${x}'`).join(' | ')}>`;
}

