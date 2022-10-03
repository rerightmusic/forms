import { right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { invalid, Validator, withError } from './validator';

export function multiSelect<R, Req extends boolean, V>(
  label: Dynamic<SelectedOption[] | null, string>,
  options: Dynamic<SelectedOption[] | null, Option[]>,
  validate: Dynamic<
    SelectedOption[] | null,
    (
      v: Validator<false, SelectedOption[] | null, SelectedOption[] | null>
    ) => Validator<Req, SelectedOption[] | null, V>
  >,
  opts?: Dynamic<
    SelectedOption[] | null,
    {
      readonly?: boolean;
      dropdown?: boolean;
      ignore?: boolean;
      visible?: boolean;
      minItems?: number;
      maxItems?: number;
    }
  >
): NestedInputBlock<
  R,
  Req,
  SelectedOption[] | null,
  SelectedOption[] | string[] | null,
  V,
  MultiSelectInputBlock,
  {}
> {
  const getValidation = (prov: SelectedOption[] | null) => {
    const opts_ = opts && fromDyn(prov, opts);
    return new Validator<false, SelectedOption[] | null, SelectedOption[] | null>(
      false,
      v => right(v),
      p => p === null
    )
      .andThen(v => {
        if (v) {
          if (opts_?.maxItems && opts_.maxItems < v.length) {
            return invalid(`Please select a maximum of ${opts_.maxItems} item(s)`, 'edited');
          }
          if (opts_?.minItems && opts_.minItems > v.length) {
            return invalid(`Please select at least ${opts_.minItems} item(s)`, 'edited');
          }
        }
        return right(v);
      })
      .chain(fromDyn(prov, validate));
  };

  const toSelectedOptions = (s: SelectedOption[] | string[] | null) => {
    if (!s) return s;
    return s.map(x => (typeof x === 'string' ? { value: x } : x));
  };

  return new NestedInputBlock({
    calculateState: ({ state, seed }) => {
      const seed_ = toSelectedOptions(seed);
      const validation = getValidation(state?.get.partialState || seed_);
      const opts_ = opts && fromDyn(state?.get.partialState || seed_, opts);
      return {
        tag: 'InputState',
        partialState: state?.get.partialState || seed_ || validation._default,
        ignore: opts_?.ignore,
        visible: opts_?.visible,
        edited: state?.get.edited || false,
        valid: validation.validate(state?.get.partialState || seed_ || validation._default),
      };
    },
    block: ({ get, set, showErrors }) => {
      const validation = getValidation(get.partialState || null);
      const opts_ = opts && fromDyn(get.partialState || null, opts);
      return {
        tag: 'MultiSelectInputBlock',
        visible: opts_?.visible,
        label: fromDyn(get.partialState || null, label),
        options: fromDyn(get.partialState || null, options),
        readonly: opts_?.readonly,
        dropdown: opts_?.dropdown,
        value: get.partialState || null,
        required: validation._required,
        error: withError(validation.validate(get.partialState), get.edited, showErrors),
        onChange: (v: SelectedOption[]) => {
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
  subOptions?: Option[];
  value: string;
};

export type SelectedOption = {
  subOptions?: SelectedOption[];
  value: string;
};

export type MultiSelectInputBlock = {
  tag: 'MultiSelectInputBlock';
  onChange: (v: SelectedOption[]) => void;
  options: Option[];
  required: boolean;
  error: string;
  label: string;
  value: SelectedOption[] | null;
  visible?: boolean;
  readonly?: boolean;
  dropdown?: boolean;
};
