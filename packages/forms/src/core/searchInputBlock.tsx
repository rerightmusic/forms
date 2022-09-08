import { Either, right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { Validator, withError } from './validator';

export function search<R, T, Req extends boolean, V>(
  label: string,
  onSearch: (keywords: string) => Promise<Either<string, SearchValue<T>[]>>,
  isEqual: (v1: T, v2: T) => boolean,
  validate: Dynamic<
    SearchValue<T> | null,
    (
      v: Validator<false, SearchValue<T> | null, SearchValue<T> | null>
    ) => Validator<Req, SearchValue<T> | null, V>
  >,
  opts?: Dynamic<
    SearchValue<T> | null,
    {
      readonly?: boolean;
      disabled?: boolean;
      visible?: boolean;
      ignore?: boolean;
      onSelectedClick?: (selected: SearchValue<T>) => void;
      onSelectedHref?: (selected: SearchValue<T>) => string;
      createFromText?: (tx: string) => SearchValue<T>;
      createNew?: (value: string) => {
        onClick: () => void;
        label: string;
      }[];
    }
  >
): NestedInputBlock<R, Req, SearchValue<T> | null, SearchValue<T> | null, V, SearchInputBlock<T>> {
  const getValidation = (prov: SearchValue<T> | null) =>
    new Validator<false, SearchValue<T> | null, SearchValue<T> | null>(
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
    block: ({ get, set }) => {
      const validation = getValidation(get.partialState || null);
      const opts_ = opts && fromDyn(get.partialState, opts);
      return {
        tag: 'SearchInputBlock',
        label,
        value: get.partialState || null,
        required: validation._required,
        readonly: opts_?.readonly,
        disabled: opts_?.disabled,
        visible: opts_?.visible,
        createNew: opts_?.createNew,
        createFromText: opts_?.createFromText,
        isEqual,
        error: withError(validation.validate(get.partialState), get.edited),
        onSelectedClick: opts_?.onSelectedClick,
        onSelectedHref: opts_?.onSelectedHref,
        onSearch,
        onChange: v => {
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

export type SearchValue<T> = {
  value: T;
  title: string;
  subtitle?: string;
};

export type SearchInputBlock<T> = {
  tag: 'SearchInputBlock';
  onChange: (v: SearchValue<T> | null) => void;
  onSelectedClick?: (selected: SearchValue<T>) => void;
  onSelectedHref?: (selected: SearchValue<T>) => string;
  readonly?: boolean;
  disabled?: boolean;
  visible?: boolean;
  createFromText?: (tx: string) => SearchValue<T>;
  createNew?: (value: string) => {
    onClick: () => void;
    label: string;
  }[];
  required: boolean;
  error: string;
  label: string;
  value: SearchValue<T> | null;
  isEqual: (v1: T, v2: T) => boolean;
  onSearch: (keywords: string) => Promise<Either<string, SearchValue<T>[]>>;
};
