import { right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { Validator, withError } from './validator';

export function duration<R, Req extends boolean, V>(
  label: Dynamic<number | null, string>,
  validate: Dynamic<
    number | null,
    (v: Validator<false, number | null, number | null>) => Validator<Req, number | null, V>
  >
): NestedInputBlock<R, Req, number | null, number | null, V, DurationInputBlock> {
  const getValidation = (prov: number | null) =>
    new Validator<false, number | null, number | null>(
      false,
      v => right(v),
      p => p === null
    ).chain(fromDyn(prov, validate));

  return new NestedInputBlock({
    calculateState: ({ state, seed }) => {
      const validation = getValidation(state?.get.partialState || seed);
      return {
        tag: 'InputState',
        partialState: state?.get.partialState || seed || validation._default,
        edited: state?.get.edited || false,
        valid: validation.validate(state?.get.partialState || seed || validation._default),
      };
    },
    block: ({ get, set }) => {
      const validation = getValidation(get.partialState || null);

      return {
        tag: 'DurationInputBlock',
        label: fromDyn(get.partialState || null, label),
        value: get.partialState || null,
        required: validation._required,
        error: withError(validation.validate(get.partialState), get.edited),
        onChange: (v: number | null) => {
          const validation = getValidation(v);
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

export type DurationInputBlock = {
  tag: 'DurationInputBlock';
  onChange: (v: number | null) => void;
  required: boolean;
  error: string;
  label: string;
  value: number | null;
};
