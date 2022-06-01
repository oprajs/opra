import {ExecutionContext, Type} from '@nestjs/common';
import {OpraURL, OpraURLSearchParams} from '@opra/url';

export class RequestNode {
  readonly url: OpraURL;
  readonly executionContext: ExecutionContext;
  readonly context?: any;
  readonly entity: Type;
  readonly pathIndex: number = 0;
  readonly resource: string;
  readonly resourceKey?: any;
  readonly parent?: RequestNode;
  readonly queryParams?: OpraURLSearchParams;
  readonly thisValue?: any;

  constructor(v: {
    url: OpraURL;
    executionContext: ExecutionContext;
    context?: any;
    entity: Type;
    pathIndex?: number;
    resource: string;
    resourceKey?: any;
    parent?: RequestNode;
    queryParams?: OpraURLSearchParams;
    thisValue?: any;
  }) {
    if (v)
      Object.assign(this, v);
    this.pathIndex = this.pathIndex || 0;
  }

  get filter(): object | null {
    return this.queryParams?.get('_filter') ?? null;
  }

  get limit(): number | null {
    return this.queryParams?.get('_limit') ?? null;
  }

  get skip(): number | null {
    return this.queryParams?.get('_skip') ?? null;
  }

  get elements(): string[] | null {
    const s = this.queryParams?.get('_elements')
    return s ? (Array.isArray(s) ? s : [s]) : null;
  }

  get exclude(): string[] | null {
    const s = this.queryParams?.get('_exclude')
    return s ? (Array.isArray(s) ? s : [s]) : null;
  }

  get include(): string[] | null {
    const s = this.queryParams?.get('_include')
    return s ? (Array.isArray(s) ? s : [s]) : null;
  }

  get distinct(): boolean | null {
    return this.queryParams?.get('_distinct') ?? null;
  }

  get total(): boolean | null {
    return this.queryParams?.get('_total') ?? null;
  }

}
