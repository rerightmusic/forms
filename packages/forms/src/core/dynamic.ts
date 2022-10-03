export type Dynamic<A, B> = WithDynamic<A, B> | B;

export type WithDynamic<A, B> = {
  tag: 'WithDynamic';
  value: (v: A) => B;
};

export function dyn<A, B>(f: (v: A) => B): WithDynamic<A, B> {
  return {
    tag: 'WithDynamic',
    value: f,
  };
}

export const fromDyn: <A, B>(s: A, v: Dynamic<A, B>) => B = (s, v) => {
  if (v && typeof v === 'object' && 'tag' in v && v.tag === 'WithDynamic') {
    return v.value(s);
  }
  return v as any;
};

export function mapDynamic<A, B, C>(v: Dynamic<A, B>, f: (b: B) => Dynamic<A, C>): Dynamic<A, C> {
  if (v && typeof v === 'object' && 'tag' in v && v.tag === 'WithDynamic') {
    return {
      tag: 'WithDynamic',
      value: (a: A) => f(v.value(a)),
    } as WithDynamic<A, C>;
  }
  return f(v as B);
}
