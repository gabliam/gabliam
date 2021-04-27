/**
 * Converts string into camelCase.
 *
 * @see http://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 */
export function camelCase(str: string, firstCapital = false): string {
  str = str.replace(/^([A-Z])|[\s-_]+(\w)/g, (_, p1, p2) => {
    if (p2) {
      return p2.toUpperCase();
    }
    return p1.toLowerCase();
  });
  if (str[0] && firstCapital) {
    str = str[0].toUpperCase() + str.slice(1);
  }
  return str;
}
