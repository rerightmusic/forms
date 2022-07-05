import { right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { invalid, Validator, withError } from './validator';

export function multiSelect<R, Req extends boolean, V>(
  label: Dynamic<string[] | null, string>,
  options: Dynamic<string[] | null, Option[]>,
  validate: Dynamic<
    string[] | null,
    (v: Validator<false, string[] | null, string[] | null>) => Validator<Req, string[] | null, V>
  >,
  opts?: Dynamic<
    string[] | null,
    {
      readonly?: boolean;
      dropdown?: boolean;
      ignore?: boolean;
      visible?: boolean;
      minItems?: number;
      maxItems?: number;
    }
  >
): NestedInputBlock<R, Req, string[] | null, string[] | null, V, MultiSelectInputBlock> {
  const getValidation = (prov: string[] | null) => {
    const opts_ = opts && fromDyn(prov, opts);
    return new Validator<false, string[] | null, string[] | null>(
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

  return new NestedInputBlock({
    calculateState: ({ get, seed }) => {
      const validation = getValidation(get?.partialState || seed);
      const opts_ = opts && fromDyn(get?.partialState || seed, opts);
      return {
        tag: 'InputState',
        partialState: get?.partialState || seed || validation._default,
        ignore: opts_?.ignore,
        visible: opts_?.visible,
        edited: get?.edited || false,
        valid: validation.validate(get?.partialState || seed || validation._default),
      };
    },
    block: ({ get, set }) => {
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
        error: withError(validation.validate(get.partialState), get.edited),
        onChange: (v: string[]) => {
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

export type MultiSelectInputBlock = {
  tag: 'MultiSelectInputBlock';
  onChange: (v: string[]) => void;
  options: Option[];
  required: boolean;
  error: string;
  label: string;
  value: string[] | null;
  visible?: boolean;
  readonly?: boolean;
  dropdown?: boolean;
};
