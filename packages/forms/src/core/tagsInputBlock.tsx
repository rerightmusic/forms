import { Either, right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { invalid, Validator, withError } from './validator';

export function tags<R, Req extends boolean, V>(
  label: string,
  onSearch: (keywords: string) => Promise<Either<string, TagsResult[]>>,
  validate: Dynamic<
    Tag[] | null,
    (v: Validator<false, Tag[] | null, Tag[] | null>) => Validator<Req, Tag[] | null, V>
  >,
  opts?: Dynamic<
    Tag[] | null,
    {
      width?: string;
      minItems?: number;
      maxItems?: number;
      selectFrom?: { tags: TagsResult[]; freeForm: boolean };
    }
  >
): NestedInputBlock<R, Req, Tag[] | null, TagsResult[] | null, V, TagsInputBlock, {}> {
  const getValidation = (prov: Tag[] | null) =>
    new Validator<false, Tag[] | null, Tag[] | null>(
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
        tag: 'TagsInputBlock',
        label,
        value: get.partialState || null,
        required: validation._required,
        error: withError(validation.validate(get.partialState), get.edited, showErrors),
        selectFrom: opts_?.selectFrom,
        width: opts_?.width,
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

export type TagsInputBlock = {
  tag: 'TagsInputBlock';
  onChange: (v: Tag[]) => void;
  required: boolean;
  error: string;
  label: string;
  width?: string;
  value: Tag[] | null;
  selectFrom?: { tags: TagsResult[]; freeForm: boolean };
  onSearch: (keywords: string) => Promise<Either<string, TagsResult[]>>;
};

export type TagsResult = {
  id: string;
  tag: string;
};

export type Tag = {
  id?: string;
  tag: string;
};
