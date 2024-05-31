/** monkey patch (hijack)
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
 */
if (!(BigInt.prototype as any).toJSON)
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

if (!(RegExp.prototype as any).toJSON)
  (RegExp.prototype as any).toJSON = function () {
    return this.toString();
  };
