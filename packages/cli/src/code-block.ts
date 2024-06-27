export class CodeBlock {
  [index: string]: any;

  toString() {
    // if (this.content) return this.content;
    let out = '';
    for (const x of Object.values(this)) {
      out += String(x);
    }
    return out;
  }

  [Symbol.toStringTag]() {
    return this.toString();
  }
}
