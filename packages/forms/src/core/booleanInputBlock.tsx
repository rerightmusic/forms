import { right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { Validator, withError } from './validator';

export function boolean<R, Req extends boolean, V>(
  label: Dynamic<boolean | null, string>,
  validate: Dynamic<
    boolean | null,
    (v: Validator<false, boolean | null, boolean | null>) => Validator<Req, boolean | null, V>
  >,
  opts?: Dynamic<
    boolean | null,
    {
      visible?: boolean;
      ignore?: boolean;
    }
  >
): NestedInputBlock<R, Req, boolean | null, boolean | null, V, BooleanInputBlock, {}> {
  const getValidation = (prov: boolean | null) =>
    new Validator<false, boolean | null, boolean | null>(
      false,
      v => right(v),
      p => p === null
    ).chain(fromDyn(prov, validate));

  return new NestedInputBlock({
    calculateState: ({ state, seed }) => {
      const validation = getValidation(state?.get.partialState || seed);
      const opts_ = opts && fromDyn(state?.get.partialState || seed, opts);
      return {
        tag: 'InputState',
        partialState: state?.get.partialState || seed || validation._default,
        edited: state?.get.edited || false,
        ignore: opts_?.ignore,
        visible: opts_?.visible,
        valid: validation.validate(state?.get.partialState || seed || validation._default),
      };
    },
    block: ({ get, set, showErrors }) => {
      const validation = getValidation(get.partialState || null);
      const opts_ = opts && fromDyn(get.partialState, opts);

      return {
        tag: 'BooleanInputBlock',
        label: fromDyn(get.partialState || null, label),
        value: get.partialState,
        required: validation._required,
        error: withError(validation.validate(get.partialState), get.edited, showErrors),
        visible: opts_?.visible,
        onChange: (v: boolean) => {
          const validation = getValidation(v);
          const val = v ? v : null;
          set({
            ...get,
            tag: 'InputState',
            edited: true,
            partialState: val,
            valid: validation.validate(val),
          });
        },
      };
    },
  });
}

export type BooleanInputBlock = {
  tag: 'BooleanInputBlock';
  onChange: (v: boolean) => void;
  required: boolean;
  error: string;
  label: string;
  value: boolean | null;
  visible?: boolean;
};
