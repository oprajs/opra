export const DATATYPE_METADATA = Symbol('DATATYPE_METADATA');
export const RESOURCE_METADATA = Symbol('RESOURCE_METADATA');
export const DECORATOR = Symbol('DECORATOR');
export const SERVICE_NAME_PATTERN = /^[a-z][\w_]*$/i;
export const NAMESPACE_PATTERN = /([a-z$_]\w+)(:.+)/i;
export const TYPENAME_PATTERN = /([a-z][\w_]+)/i;
export const EXTRACT_TYPENAME_PATTERN = /^(.*)Type(\d*)$/;
export const SORT_FIELD_PATTERN = /^([+-])?([a-z$_][\w.]+)$/;
