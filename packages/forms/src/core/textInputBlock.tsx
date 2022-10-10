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
  opts?: Dynamic<
    string | null,
    {
      long?: boolean;
      visible?: boolean;
      ignore?: boolean;
      multiline?: boolean;
      fetchButton?: { label: string; onClick: () => Promise<Either<string, string>> };
      suffixImage?: { image: string; width: string; height: string };
    }
  >
): NestedInputBlock<R, Req, string | null, string | null, V, TextInputBlock, {}> {
  const getValidation = (prov: string | null) =>
    new Validator<false, string | null, string | null>(
      false,
      v => right(v),
      p => p === null || p === ''
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
        tag: 'TextInputBlock',
        label: fromDyn(get.partialState || null, label),
        value: get.partialState || null,
        required: validation._required,
        error: withError(validation.validate(get.partialState), get.edited, showErrors),
        multiline: opts_?.multiline,
        visible: opts_?.visible,
        fetchButton: opts_?.fetchButton,
        suffixImage: opts_?.suffixImage,
        long: opts_?.long,
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
  long?: boolean;
  value: string | null;
  visible?: boolean;
  multiline?: boolean;
  fetchButton?: { label: string; onClick: () => Promise<Either<string, string>> };
  suffixImage?: { image: string; width: string; height: string };
};
