import { Either, right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { invalid, Validator, withError } from './validator';

export function typedTags<T extends string, R, Req extends boolean, V>(
  label: string,
  types: { label: string; value: T }[],
  onSearch: (params: { keywords?: string; type: T }) => Promise<Either<string, TypedTag<T>[]>>,
  validate: Dynamic<
    PartialTypedTag<T>[] | null,
    (
      v: Validator<false, PartialTypedTag<T>[] | null, PartialTypedTag<T>[] | null>
    ) => Validator<Req, PartialTypedTag<T>[] | null, V>
  >,
  opts?: Dynamic<
    PartialTypedTag<T>[] | null,
    {
      minItems?: number;
      maxItems?: number;
      allowNewTags?: boolean;
    }
  >
): NestedInputBlock<
  R,
  Req,
  PartialTypedTag<T>[] | null,
  TypedTag<T>[] | null,
  V,
  TypedTagsInputBlock<T>,
  {}
> {
  const getValidation = (prov: PartialTypedTag<T>[] | null) =>
    new Validator<false, PartialTypedTag<T>[] | null, PartialTypedTag<T>[] | null>(
      false,
      v => {
        const opts_ = opts && fromDyn(prov, opts);
        const length = v === null ? 0 : v.length;
        if (opts_?.maxItems && opts_.maxItems < length) {
          return invalid(`Please add a maximum of ${opts_.maxItems} item(s)`, 'edited');
        }
        if (opts_?.minItems && opts_.minItems > length) {
          return invalid(`Please add at least ${opts_.minItems} item(s)`, 'edited');
        }
        return right(v);
      },
      p => p === null || p.length === 0
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
      const validation = getValidation(get.partialState || null);
      const opts_ = opts && fromDyn(get.partialState || null, opts);
      return {
        tag: 'TypedTagsInputBlock',
        label,
        types: types,
        value: get.partialState || null,
        required: validation._required,
        error: withError(validation.validate(get.partialState), get.edited, showErrors),
        allowNewTags: opts_?.allowNewTags,
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

export type TypedTagsInputBlock<T extends string> = {
  tag: 'TypedTagsInputBlock';
  required: boolean;
  error: string;
  label: string;
  types: { label: string; value: T }[];
  allowNewTags?: boolean;
  value: PartialTypedTag<T>[] | null;
  onChange: (v: PartialTypedTag<T>[]) => void;
  onSearch: (props: { keywords?: string; type: T }) => Promise<Either<string, TypedTag<T>[]>>;
};

export type PartialTypedTag<T extends string> = {
  id?: string;
  type: T;
  tag: string;
};

export type TypedTag<T extends string> = {
  id: string;
  type: T;
  tag: string;
};
