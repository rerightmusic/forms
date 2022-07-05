export const enumFromString = (e: any, str: string) => {
  return (e as any)[str];
};

export const enumToString = (e: any, str: string) => {
  return e[str];
};
