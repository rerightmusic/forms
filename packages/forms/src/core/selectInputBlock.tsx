import { right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { Validator, withError } from './validator';

export function select<R, Req extends boolean, V>(
  label: Dynamic<string | null, string>,
  options: Dynamic<string | null, Option[]>,
  validate: Dynamic<
    string | null,
    (v: Validator<false, string | null, string | null>) => Validator<Req, string | null, V>
  >,
  opts?: Dynamic<
    string | null,
    {
      readonly?: boolean;
      chips?: boolean;
      inline?: boolean;
    }
  >
): NestedInputBlock<R, Req, string | null, string | null, V, SelectInputBlock, {}> {
  const getValidation = (prov: string | null) =>
    new Validator<false, string | null, string | null>(
      false,
      v => right(v),
      p => p === null || p === ''
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
    block: ({ get, set, showErrors }) => {
      const options_ = fromDyn(get.partialState || null, options);
      const validation = getValidation(get.partialState || null);
      const opts_ = opts && fromDyn(get.partialState || null, opts);
      return {
        tag: 'SelectInputBlock',
        label: fromDyn(get.partialState || null, label),
        options: options_,
        readonly: opts_?.readonly,
        chips: opts_?.chips,
        inline: opts_?.inline,
        value:
          get.partialState && options_.find(o => o.value === get.partialState)
            ? get.partialState
            : null,
        required: validation._required,
        error: withError(validation.validate(get.partialState), get.edited, showErrors),
        onChange: (v: string | null) => {
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

export type Option = {
  name: string;
  value: string;
};

export type SelectInputBlock = {
  tag: 'SelectInputBlock';
  onChange: (v: string | null) => void;
  options: Option[];
  required: boolean;
  error: string;
  label: string;
  value: string | null;
  readonly?: boolean;
  chips?: boolean;
  inline?: boolean;
};
