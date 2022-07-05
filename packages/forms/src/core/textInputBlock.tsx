import { Either, left, right } from 'fp-ts/lib/Either';
import { NestedInputBlock } from './inputBlock';
import { Dynamic, fromDyn, mapDynamic } from './dynamic';
import { Validator, withError } from './validator';

export function text<R, Req extends boolean, V>(
  label: Dynamic<string | null, string>,
  validate: Dynamic<
    string | null,
    (v: Validator<false, string | null, string | null>) => Validator<Req, string | null, V>
  >,
  opts?: {
    multiline?: boolean;
    fetchButton?: { label: string; onClick: () => Promise<Either<string, string>> };
  }
): NestedInputBlock<R, Req, string | null, string | null, V, TextInputBlock> {
  const getValidation = (prov: string | null) =>
    new Validator<false, string | null, string | null>(
      false,
      v => right(v),
      p => p === null || p === ''
    ).chain(fromDyn(prov, validate));

  return new NestedInputBlock({
    calculateState: ({ get, seed }) => {
      const validation = getValidation(get?.partialState || seed);
      return {
        tag: 'InputState',
        partialState: get?.partialState || seed || validation._default,
        edited: get?.edited || false,
        valid: validation.validate(get?.partialState || seed || validation._default),
      };
    },
    block: ({ get, set }) => {
      const validation = getValidation(get.partialState || null);
      const opts_ = opts && fromDyn(get.partialState, opts);

      return {
        tag: 'TextInputBlock',
        label: fromDyn(get.partialState || null, label),
        value: get.partialState || null,
        required: validation._required,
        error: withError(validation.validate(get.partialState), get.edited),
        multiline: opts_?.multiline,
        fetchButton: opts_?.fetchButton,
        onChange: (v: string) => {
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

export const email = <Req extends boolean, V>(
  label: Dynamic<string | null, string>,
  validate: Dynamic<
    string | null,
    (v: Validator<false, string | null, string | null>) => Validator<Req, string | null, V>
  >
) => {
  const val = mapDynamic(validate, d => {
    return (v: Validator<false, string | null, string | null>) => {
      return v
        .andThen(p => {
          if (
            p &&
            p.length > 0 &&
            !String(p)
              .toLowerCase()
              .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              )
          ) {
            return left('Email is not valid');
          } else return right(p);
        })
        .chain(d);
    };
  });

  return text(label, val);
};

export type TextInputBlock = {
  tag: 'TextInputBlock';
  onChange: (v: string) => void;
  required: boolean;
  error: string;
  label: string;
  value: string | null;
  multiline?: boolean;
  fetchButton?: { label: string; onClick: () => Promise<Either<string, string>> };
};
