import {OpraURL} from '@opra/url';

export class OpraRequest {

  constructor(public url: OpraURL, readonly scope: string) {
  }

  get collection(): string {
    const p = this.url.path.get(0);
    return p ? p.resource : '';
  }

  get filter(): object {
    return this.url.searchParams.get('_filter') ?? undefined;
  }

  get limit(): number | undefined {
    return this.url.searchParams.get('_limit') ?? undefined;
  }

  get skip(): number | undefined {
    return this.url.searchParams.get('_skip') ?? undefined;
  }

  get elements(): string[] | undefined {
    const s = this.url.searchParams.get('_elements')
    return s ? (Array.isArray(s) ? s : [s]) : undefined;
  }

  get exclude(): string[] | undefined {
    const s = this.url.searchParams.get('_exclude')
    return s ? (Array.isArray(s) ? s : [s]) : undefined;
  }

  get include(): string[] | undefined {
    const s = this.url.searchParams.get('_include')
    return s ? (Array.isArray(s) ? s : [s]) : undefined;
  }

  get distinct(): boolean | null {
    return this.url.searchParams.get('_distinct') ?? undefined;
  }

  get total(): boolean | null {
    return this.url.searchParams.get('_total') ?? undefined;
  }

  toJSON() {
    return {
      scope: this.scope,
      collection: this.collection,
      filter: this.filter,
      limit: this.limit,
      skip: this.skip,
      elements: this.elements,
      exclude: this.exclude,
      include: this.include,
      distinct: this.distinct,
      total: this.total
    }
  }

}
