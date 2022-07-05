import { left, right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn, mapDynamic } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { invalid, Validator, withError } from './validator';

export function number<R, Req extends boolean, V>(
  label: string,
  validate: Dynamic<
    string | number | null,
    (
      v: Validator<false, string | number | null, number | null>
    ) => Validator<Req, string | number | null, V>
  >,
  opts?: {
    suffix?: string;
  }
): NestedInputBlock<R, true, string | number | null, string | number | null, V, NumberInputBlock> {
  const getValidation = (prov: string | number | null) =>
    new Validator<false, string | number | null, number | null>(
      false,
      v => {
        if (v !== null && v !== '') {
          const fl = typeof v === 'string' ? parseFloat(v) : v;
          return !isNaN(fl) ? right(fl) : invalid('Not a number', 'always');
        }
        return right(v === '' ? null : v);
      },
      p => p === null
    ).chain(fromDyn(prov, validate));

  return new NestedInputBlock({
    calculateState: ({ get, seed }) => {
      const validation = getValidation(get?.partialState || seed);
      return {
        tag: 'InputState',
        partialState: get?.partialState || seed || validation._default,
        edited: get?.edited || false,
        valid: validation.validate(get?.partialState || seed),
      };
    },
    block: ({ get, set }) => {
      const validation = getValidation(get.partialState || null);

      return {
        tag: 'NumberInputBlock',
        label,
        value:
          get.partialState !== null
            ? typeof get.partialState === 'number'
              ? get.partialState.toString()
              : get.partialState
            : null,
        required: validation._required,
        error: withError(validation.validate(get.partialState), get.edited),
        suffix: opts?.suffix,
        onChange: (v: string) => {
          set({
            ...get,
            tag: 'InputState',
            edited: true,
            partialState: v,
            valid: validation.validate(v),
          });
        },
      };
    },
  });
}

export const percentage100 = <Req extends boolean, V>(
  label: string,
  validate: Dynamic<
    string | number | null,
    (
      v: Validator<false, string | number | null, number | null>
    ) => Validator<Req, string | number | null, V>
  >
) => {
  const val = mapDynamic(validate, d => {
    return (v: Validator<false, string | number | null, number | null>) => {
      return v
        .andThen(p => {
          if (p !== null && (p < 0 || p > 100)) {
            return left('Percentage must be between 0 and 100');
          }
          return right(p);
        })
        .chain(d);
    };
  });

  return number(label, val, {
    suffix: '%',
  });
};

export type NumberInputBlock = {
  tag: 'NumberInputBlock';
  onChange: (v: string) => void;
  required: boolean;
  error: string;
  label: string;
  value: string | null;
  suffix?: string;
};
