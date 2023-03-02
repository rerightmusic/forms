export const toDate = (date: string) => {
  const split = date.split('-').flatMap(x => {
    const r = parseInt(x);
    return !isNaN(r) ? [r] : [];
  });
  if (split.length === 3) {
    return new Date(split[0], split[1] - 1, split[2]);
  } else if (split.length === 1) {
    return new Date(split[0], 0, 1);
  } else {
    return null;
  }
};
