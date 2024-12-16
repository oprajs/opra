import { type Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@(SimpleType({
  name: 'email',
  description: 'An email value',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
}).Example('some.body@example.com'))
export class EmailType {
  constructor(attributes?: Partial<EmailType>) {
    if (attributes) Object.assign(this, attributes);
  }

  @SimpleType.Attribute({
    description:
      'If set to `true`, the validator will also match `Display Name <email-address>',
    default: false,
  })
  allowDisplayName?: boolean;

  @SimpleType.Attribute({
    description:
      'If set to `true`, the validator will reject strings without the format `Display Name <email-address>',
    default: false,
  })
  requireDisplayName?: boolean;

  @SimpleType.Attribute({
    description:
      "If set to `false`, the validator will not allow any non-English UTF8 character in email address's local part",
    default: true,
  })
  utf8LocalPart?: boolean;

  @SimpleType.Attribute({
    description:
      'If set to `true`, the validator will not check for the standard max length of an email',
    default: false,
  })
  ignoreMaxLength?: boolean;

  @SimpleType.Attribute({
    description:
      'If set to `true`, the validator will allow IP addresses in the host part',
    default: false,
  })
  allowIpDomain?: boolean;

  @SimpleType.Attribute({
    description:
      'If set to `true`, some additional validation will be enabled, ' +
      'e.g. disallowing certain syntactically valid email addresses that are rejected by GMail.',
    default: false,
  })
  domainSpecificValidation?: boolean;

  @SimpleType.Attribute({
    description:
      'If set to an array of strings and the part of the email after the @ symbol ' +
      ' one of the strings defined in it, the validation fails.',
  })
  hostBlacklist?: string[];

  @SimpleType.Attribute({
    description:
      'If set to an array of strings and the part of the email after the @ symbol ' +
      ' matches none of the strings defined in it, the validation fails.',
  })
  hostWhitelist?: string[];

  @SimpleType.Attribute({
    description:
      'If set to a string, then the validator will reject emails that include ' +
      ' any of the characters in the string, in the name part.',
  })
  blacklistedChars?: string;

  protected [DECODER](properties?: Partial<this>): Validator {
    return vg.isEmail({ ...properties, coerce: true });
  }

  protected [ENCODER](properties?: Partial<this>): Validator {
    return vg.isEmail({ ...properties, coerce: true });
  }
}
