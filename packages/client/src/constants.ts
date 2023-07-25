export const JSON_CONTENT_TYPE_PATTERN = /^application\/([\w-]+\+)?\bjson\b/i;
export const TEXT_CONTENT_TYPE_PATTERN = /^text\/.*$/i;
export const FORMDATA_CONTENT_TYPE_PATTERN = /^multipart\/\bform-data\b/i;

export const kRequest = Symbol.for('kRequest');
export const kContext = Symbol.for('kContext');
