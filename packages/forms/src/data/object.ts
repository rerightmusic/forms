export const mapLeafTypes = <A, B>(
  v: Record<string, any>,
  isType: ((v: any) => v is A) | 'all',
  f: (v: A, key: string) => B
) => {
  return mapReduceLeafTypes(v, isType, {}, (a, _, key) => ({ value: f(a, key), state: {} })).value;
};

export const mapReduceLeafTypes = <A, B, S>(
  v: Record<string, any>,
  isType: ((v: any) => v is A) | 'all',
  initialState: S,
  mapF: (v: A, state: S, key: string) => { value: B; state: S }
) => {
  return mapReduceLeafTypes_('', v, isType, initialState, mapF);
};

const mapReduceLeafTypes_: <A, B, S>(
  key: string,
  v: any,
  isType: ((v: any) => v is A) | 'all',
  state: S,
  mapF: (v: A, state: S, key: string) => { state: S; value: B }
) => { state: S; value: any } = (key, v, isType, state, mapF) => {
  if (!v) return { state, value: v };
  if (isType !== 'all' && isType(v)) {
    return mapF(v, state, key);
  }

  if (Array.isArray(v)) {
    return v.reduce(
      (prev, v_) => {
        const o = mapReduceLeafTypes_(key, v_, isType, prev.state, mapF);
        return { state: o.state, value: prev.value.concat([o.value]) };
      },
      { state, value: [] }
    );
  }

  if (typeof v === 'object') {
    const stateAndEntries = Object.entries(v).reduce(
      (prev, [k, v]) => {
        const o = mapReduceLeafTypes_(`${key ? `${key}.` : ''}.${k}`, v, isType, prev.state, mapF);
        return { state: o.state, value: prev.value.concat([[k, o.value]]) };
      },
      { state, value: [] } as any
    );

    return { state: stateAndEntries.state, value: Object.fromEntries(stateAndEntries.value) };
  }

  if (isType === 'all') {
    return mapF(v, state, key);
  }

  return { state, value: v };
};

export const isType = <A>(validateType: (v: any) => boolean) =>
  function (v: any): v is A {
    if (validateType(v)) {
      return true;
    }
    return false;
  };

export const isTag = <A extends { tag: any }>(tag: string) =>
  isType<A>(v => typeof v === 'object' && 'tag' in v && v.tag === tag);
