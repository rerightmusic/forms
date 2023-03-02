export * from './object';
export * from './string';
export * from './enum';
export * from './date';

export const assertNever = (value: never, noThrow?: boolean): never => {
  if (noThrow) {
    return value;
  }

  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
};
