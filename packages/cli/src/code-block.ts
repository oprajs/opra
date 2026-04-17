/**
 * CodeBlock
 *
 * A class representing a block of code, which can be composed of multiple segments.
 */
export class CodeBlock {
  [index: string]: any;

  /**
   * Concatenates all segments of the code block into a single string.
   *
   * @returns The full code as a string.
   */
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
