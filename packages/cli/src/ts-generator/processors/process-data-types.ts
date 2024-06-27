import path from 'path';
import { ComplexType, DataType, EnumType, MappedType, MixinType, SimpleType } from '@opra/common';
import { CodeBlock } from '../../code-block.js';
import { TsFile } from '../ts-file.js';
import type { TsGenerator } from '../ts-generator';
import { wrapJSDocString } from '../utils/string-utils.js';

const internalTypeNames = ['any', 'boolean', 'bigint', 'number', 'null', 'string', 'object'];

type Intent = 'scope' | 'extends' | 'field';

export async function processDataType(this: TsGenerator, dataType: DataType): Promise<TsFile | undefined> {
  const doc = dataType.node.getDocument();
  if (doc.id !== this._document?.id) {
    const { generator } = await this.processDocument(doc);
    return await generator.processDataType(dataType);
  }

  const typeName = dataType.name;
  if (typeName && internalTypeNames.includes(typeName)) return;

  if (!typeName) throw new TypeError(`DataType has no name`);
  let file = this._filesMap.get(dataType);
  if (file) return file;

  if (dataType instanceof SimpleType) file = this.addFile(path.join(this._documentRoot, '/simple-types.ts'), true);
  else {
    if (dataType instanceof EnumType) file = this.addFile(path.join(this._typesRoot, 'enums', typeName + '.ts'));
    else file = this.addFile(path.join(this._typesRoot, 'types', typeName + '.ts'));
  }
  this._filesMap.set(dataType, file);
  file = this._filesMap.get(dataType)!;

  if (file.exportTypes.includes(typeName)) return file;
  file.exportTypes.push(typeName);

  const typesIndexTs = this.addFile(path.join(this._typesRoot, 'index.ts'), true);
  const indexTs = this.addFile('/index.ts', true);
  indexTs.addExport(typesIndexTs.filename);

  const codeBlock = (file.code['type_' + typeName] = new CodeBlock());

  codeBlock.head = `/**\n * ${typeName}`;
  if (dataType.description) codeBlock.head += `\n * ${wrapJSDocString(dataType.description || '')}`;

  codeBlock.head += `
 * @url ${path.posix.join(doc.url || this.serviceUrl, '$schema', '#types/' + typeName)}
 */
export `;

  if (dataType instanceof EnumType) codeBlock.typeDef = await this.generateEnumTypeDefinition(dataType, 'scope');
  else if (dataType instanceof ComplexType)
    codeBlock.typeDef = await this.generateComplexTypeDefinition(dataType, file, 'scope');
  else if (dataType instanceof SimpleType)
    codeBlock.typeDef = await this.generateSimpleTypeDefinition(dataType, 'scope');
  else if (dataType instanceof MappedType)
    codeBlock.typeDef = await this.generateMappedTypeDefinition(dataType, file, 'scope');
  else if (dataType instanceof MixinType)
    codeBlock.typeDef = await this.generateMixinTypeDefinition(dataType, file, 'scope');
  else throw new TypeError(`${dataType.kind} data type (${typeName}) can not be directly exported`);

  typesIndexTs.addExport(file.filename);
  return file;
}

/**
 *
 */
export async function generateEnumTypeDefinition(
  this: TsGenerator,
  dataType: EnumType,
  intent: Intent,
): Promise<string> {
  if (intent === 'field')
    return (
      '(' +
      Object.keys(dataType.attributes)
        .map(t => `'${t}'`)
        .join(' | ') +
      ')'
    );

  if (intent !== 'scope') throw new TypeError(`Can't generate EnumType for "${intent}" intent`);

  if (!dataType.name) throw new TypeError(`Name required to generate EnumType for "${intent}" intent`);

  let out = `enum ${dataType.name} {\n\t`;
  for (const [value, info] of Object.entries(dataType.attributes)) {
    // Print JSDoc
    let jsDoc = '';
    if (dataType.attributes[value].description) jsDoc += ` * ${dataType.attributes[value].description}\n`;

    if (jsDoc) out += `/**\n${jsDoc} */\n`;

    out +=
      `${info.alias || value} = ` + (typeof value === 'number' ? value : "'" + String(value).replace("'", "\\'") + "'");
    out += ',\n\n';
  }
  return out + '\b}';
}

/**
 *
 */
export async function generateComplexTypeDefinition(
  this: TsGenerator,
  dataType: ComplexType,
  file: TsFile,
  intent: Intent,
): Promise<string> {
  if (intent === 'scope' && !dataType.name)
    throw new TypeError(`Name required to generate ComplexType for "${intent}" intent`);

  let out = intent === 'scope' ? `interface ${dataType.name} ` : '';

  const ownFields = [...dataType.fields.values()].filter(f => f.origin === dataType);

  if (dataType.base) {
    const base = await this.resolveTypeNameOrDef(dataType.base, file, 'extends');
    const omitBaseFields = dataType.base ? ownFields.filter(f => dataType.base!.fields.has(f.name)) : [];
    const baseDef = omitBaseFields.length
      ? `Omit<${base}, ${omitBaseFields.map(x => "'" + x.name + "'").join(' | ')}>`
      : `${base}`;
    if (intent === 'scope') out += `extends ${baseDef} `;
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
      out += (await this.resolveTypeNameOrDef(field.type, file, 'field')) + `${field.isArray ? '[]' : ''};\n`;
    }
  }
  if (dataType.additionalFields) out += '[key: string]: any;\n';
  return out + '\b}';
}

/**
 *
 */
export async function generateSimpleTypeDefinition(
  this: TsGenerator,
  dataType: SimpleType,
  intent: Intent,
): Promise<string> {
  if (intent === 'scope' && !dataType.name)
    throw new TypeError(`Name required to generate SimpleType for "${intent}" intent`);
  let out = intent === 'scope' ? `type ${dataType.name} = ` : '';
  out += dataType.nameMappings.js || 'any';
  return intent === 'scope' ? out + ';' : out;
}

/**
 *
 */
export async function generateMixinTypeDefinition(
  this: TsGenerator,
  dataType: MixinType,
  file: TsFile,
  intent: Intent,
): Promise<string> {
  return (await Promise.all(dataType.types.map(t => this.resolveTypeNameOrDef(t, file, intent))))
    .map(t => (t.includes('|') ? '(' + t + ')' : t))
    .join(intent === 'extends' ? ', ' : ' & ');
}

/**
 *
 */
export async function generateMappedTypeDefinition(
  this: TsGenerator,
  dataType: MappedType,
  file: TsFile,
  intent: Intent,
): Promise<string> {
  const typeDef = await this.resolveTypeNameOrDef(dataType.base, file, intent);
  const pick = dataType.pick?.length ? dataType.pick : undefined;
  const omit = !pick && dataType.omit?.length ? dataType.omit : undefined;
  const partial =
    dataType.partial === true || (Array.isArray(dataType.partial) && dataType.partial.length > 0)
      ? dataType.partial
      : undefined;
  const required =
    dataType.required === true || (Array.isArray(dataType.required) && dataType.required.length > 0)
      ? dataType.required
      : undefined;
  if (!(pick || omit || partial || required)) return typeDef;
  let out = '';
  if (partial === true) out += 'Partial<';
  else if (partial) {
    out += 'PartialSome<';
    file.addExport('ts-gems', ['PartialSome']);
  }
  if (required === true) out += 'Partial<';
  else if (required) {
    out += 'RequiredSome<';
    file.addExport('ts-gems', ['RequiredSome']);
  }
  if (pick) out += 'Pick<';
  else if (omit) out += 'Omit<';
  out += typeDef;
  if (omit || pick)
    out +=
      ', ' +
      (omit || pick)!
        .filter(x => !!x)
        .map(x => `'${x}'`)
        .join(' | ') +
      '>';
  if (partial) {
    if (Array.isArray(partial))
      out +=
        ', ' +
        partial
          .filter(x => !!x)
          .map(x => `'${x}'`)
          .join(' | ');
    out += '>';
  }
  return out;
}

/**
 *
 */
export async function resolveTypeNameOrDef(
  this: TsGenerator,
  dataType: DataType,
  file: TsFile,
  intent: Intent,
): Promise<string> {
  if (dataType.name && !dataType.embedded) {
    if (internalTypeNames.includes(dataType.name)) return dataType.name;
    const f = await this.processDataType(dataType);
    if (!f) return '';
    file.addImport(f.filename, [dataType.name], true);
    return dataType.name;
  }
  if (dataType instanceof SimpleType) return this.generateSimpleTypeDefinition(dataType, intent);
  if (dataType instanceof EnumType) return this.generateEnumTypeDefinition(dataType, intent);
  if (dataType instanceof MixinType) return this.generateMixinTypeDefinition(dataType, file, intent);
  if (dataType instanceof MappedType) return this.generateMappedTypeDefinition(dataType, file, intent);
  if (dataType instanceof ComplexType) return this.generateComplexTypeDefinition(dataType, file, intent);
  return '';
}
