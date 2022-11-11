import { Either, left, right } from 'fp-ts/lib/Either';
import _ from 'lodash';

export function recurseReduce<A, S>(
  value: Record<string, A>,
  _if: { if: (b: any) => b is A; recurse?: (v: A, parent: A) => any },
  f: (
    state: S,
    v: Either<{ parent: A; value: [] | {} | null | undefined }, A>,
    keys: (string | number)[],
    ignore: { tag: 'Ignored' }
  ) => { state: S; value: unknown | { tag: 'Ignored' } },
  initialState: S
): { state: S; record: Record<string, any> } {
  const res = _.reduce(
    value,
    (prev, next, key) => {
      const res = recurseReduce_(next, _if, f, value, prev.state, [key]);
      return {
        state: res.state,
        record: {
          ...prev.record,
          [key]: res.value,
        },
      };
    },
    { state: initialState, record: {} }
  );

  const res_ = filterIgnored(res.record);

  return {
    ...res,
    record: res_.ignore ? {} : res_.value,
  };
}

function recurseReduce_<A, S>(
  value: any,
  _if: { if: (b: any) => b is A; recurse?: (v: A, parent: A) => any },
  f: (
    state: S,
    v: Either<{ parent: A; value: [] | {} | null | undefined }, A>,
    keys: (string | number)[],
    ignore: { tag: 'Ignored' }
  ) => { state: S; value: unknown },
  prevValue: any,
  state: S,
  parentKeys: (string | number)[]
): { state: S; value: unknown } {
  if (_.isNil(value)) {
    return f(state, left({ parent: prevValue, value }), parentKeys, { tag: 'Ignored' });
  }

  if (_.isArray(value) && value.length > 0 && _if.if(value[0])) {
    return value.reduce(
      (prev, x, idx) => {
        const res = recurseReduce_(x, _if, f, value, prev.state, parentKeys.concat(idx));
        return {
          state: res.state,
          value: prev.value.concat(res.value),
        };
      },
      { state, value: [] }
    );
  }

  if (!_if.if(value) && _.isObject(value) && _.size(value) > 0 && _if.if(_.values(value)[0])) {
    return _.reduce(
      value,
      (prev, next, k) => {
        const res = recurseReduce_(next, _if, f, value, prev.state, parentKeys.concat(k));
        return {
          state: res.state,
          value: {
            ...prev.value,
            [k]: res.value,
          },
        };
      },
      { state, value: {} }
    );
  }

  if (_if.if(value) && _if.recurse) {
    return recurseReduce_(_if.recurse(value, prevValue), _if, f, value, state, parentKeys);
  }

  if (_if.if(value)) {
    return f(state, right(value), parentKeys, { tag: 'Ignored' });
  }

  return f(
    state,
    (_.isArray(value) || _.isObject(value)) && _.size(value) === 0
      ? left({ value, parent: prevValue })
      : right(prevValue),
    parentKeys,
    { tag: 'Ignored' }
  );
}

function isIgnored(x: any) {
  return typeof x === 'object' && 'tag' in x && x.tag === 'Ignored';
}

function filterIgnored(x: any): { ignore: boolean; value: any } {
  if (_.isNil(x)) return { ignore: false, value: x };
  if (isIgnored(x)) return { ignore: true, value: x };
  if (_.isArray(x)) {
    if (x.length > 0) {
      const filtered = x.flatMap(x => {
        const res = filterIgnored(x);
        return res.ignore ? [] : [res.value];
      });
      return { ignore: filtered.length === 0, value: filtered };
    }
    return { ignore: false, value: x };
  }

  if (_.isObject(x)) {
    if (_.size(x) > 0) {
      const filtered = _.reduce(
        x,
        (prev, next, k) => {
          const res = filterIgnored(next);
          if (res.ignore) return prev;
          return { ...prev, [k]: res.value };
        },
        {}
      );

      return { ignore: _.size(filtered) === 0, value: filtered };
    }
    return { ignore: false, value: x };
  }

  return { ignore: isIgnored(x), value: x };
}

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
      (prev, v_, idx) => {
        const o = mapReduceLeafTypes_(`${key}.${idx}`, v_, isType, prev.state, mapF);
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
