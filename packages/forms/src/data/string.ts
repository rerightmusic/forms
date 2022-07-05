export const camelToSpaced = (r: string) =>
  r
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .trim();

export const toLowerUnderscore = (r: string) =>
  r
    .replace(/([A-Za-z]) ([A-Za-z])/g, '$1_$2')
    .toLowerCase()
    .trim();

export const dashToCamel = (r: string) =>
  r
    .replace(/-([a-z])/gi, function (s, group1) {
      return group1.toUpperCase();
    })
    .trim();

export const dashToUpperSpaced = (r: string) =>
  r
    .replace(/-([a-z])/gi, function (_, group1) {
      return ' ' + group1.toUpperCase();
    })
    .trim();

export const regexToUpperSpaced = (exp: RegExp, r: string) =>
  r
    .replace(new RegExp(exp, 'gi'), function (_, group1) {
      return ' ' + group1.toUpperCase();
    })
    .trim();

export const title = (r: string) => r.charAt(0).toUpperCase() + r.slice(1);
