export default function replace(obj, target, replacement) {
  try {
    switch (obj.constructor) {
      case Array: {
        // Do a recursive call on all values in object, AND substitute key values using `String.prototype.replace`
        return obj.map(item => replace(item, target, replacement));
      }
      case Object: {
        // For values that aren't objects or arrays, simply return the value
        return Object.keys(obj).reduce((memo, key) => Object.assign(memo, {[key.replace(target, replacement)]: replace(obj[key], target, replacement)}), {});
      }
      default:
        return obj;
    }
  } catch (err) {
    // A try/catch is actually necessary here. This is because trying to access the `constructor` property
    // of some values throws an error. For example `null.constructor` throws a TypeError.
    return null;
  }
}
