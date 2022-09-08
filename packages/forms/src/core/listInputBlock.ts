import { right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { InputState, NestedInputBlock } from './inputBlock';
import {
  create,
  getPartial,
  getValidsOrNull,
  RecordBlockBuilder,
} from './record/recordBlockBuilder';
import { RecordPartial, RecordState, RecordValidOrNull } from './record/recordBlockTypes';
import { RecordInputBlock, RecordNestedInputBlock } from './record/recordInputBlock';
import { invalid, Validator, withError } from './validator';

export function list<
  R extends object,
  R_ extends object,
  Req extends boolean,
  S extends any[],
  V,
  V_
>(
  label: string,
  b: (r: RecordBlockBuilder<R, {}, []>) => RecordNestedInputBlock<R & R_, S, V>,
  validate: ListDynamic<
    R & R_,
    S,
    (
      v: Validator<false, RecordState<S, V>[] | null, V[] | null>
    ) => Validator<Req, RecordState<S, V>[] | null, V_>
  >,
  opts?: ListDynamic<
    R,
    S,
    {
      minItems?: number;
      maxItems?: number;
      itemLabel?: string;
      visible?: boolean;
      outlined?: boolean;
      noinline?: boolean;
      ignore?: boolean;
      copyFrom?: {
        state?: RecordState<S, V>[];
        seed?: RecordPartial<S>[];
        label: string;
      };
    }
  >
): NestedInputBlock<
  R & R_,
  Req,
  RecordState<S, V>[] | null,
  RecordPartial<S>[],
  V_,
  ListInputBlock<S, V>
> {
  const getDyn = (
    req: R & R_,
    state: RecordState<S, V>[] | null,
    partial?: RecordPartial<S>[] | null
  ) => ({
    req,
    partial: partial
      ? partial
      : (state || []).map<RecordPartial<S>>(s => getPartial(s.partialState)),
    valid: (state || []).map<RecordValidOrNull<S>>(s => getValidsOrNull(s.partialState)),
  });

  const getValidation = (
    req: R & R_,
    state: RecordState<S, V>[] | null,
    partial?: RecordPartial<S>[] | null
  ) => {
    const p = getDyn(req, state, partial);
    const opts_ = opts && fromDyn(getDyn(req, state), opts);
    return new Validator<false, RecordState<S, V>[] | null, V[] | null>(
      false,
      v => {
        if (v !== null) {
          const validItems = v.flatMap(x => {
            return x.valid._tag === 'Right' ? [x.valid.right] : [];
          });
          if (validItems.length !== v.length)
            return invalid(`Please complete or remove invalid items`, 'edited');
          return right(validItems);
        }
        return right(v);
      },
      p => {
        return p === null || p.length === 0;
      }
    )
      .andThen((v, req) => {
        if (v) {
          if (opts_?.maxItems && opts_.maxItems < v.length) {
            return invalid(`Please add a maximum of ${opts_.maxItems} item(s)`, 'edited');
          }
          if (req && opts_?.minItems && opts_.minItems > v.length) {
            return invalid(`Please add at least ${opts_.minItems} item(s)`, 'edited');
          }
        }
        return right(v);
      })
      .chain(fromDyn(p, validate));
  };
  const template = b(create());
  return new NestedInputBlock({
    calculateState: ({ req, state, seed }) => {
      const validation = getValidation(req, state?.get.partialState || null, seed);
      let st = null;
      if (seed) {
        st = seed?.map(s => {
          return template.apply.calculateState({ req, state: null, seed: s });
        });
      }

      if (state) {
        st = state.get.partialState?.map((g, idx) => {
          const s = (x: RecordState<S, V>) => {
            const p = state.get.partialState
              ? state.get.partialState
                  .slice(0, idx)
                  .concat(x)
                  .concat(state.get.partialState.slice(idx + 1))
              : null;
            state.set({
              ...state.get,
              partialState: p,
              valid: validation.validate(p),
            });
          };
          return template.apply.calculateState({ req, state: { get: g, set: s }, seed: null });
        });
      }

      const opts_ = opts && fromDyn(getDyn(req, state?.get.partialState || null, seed), opts);
      return {
        tag: 'InputState',
        ignore: opts_?.ignore,
        visible: opts_?.visible,
        partialState: st || validation._default,
        edited: state?.get.edited || false,
        valid: validation.validate(st || null),
      };
    },
    block: ({ req, get, set }) => {
      const validation = getValidation(req, get.partialState || null);
      const opts_ = opts && fromDyn(getDyn(req, get.partialState || null), opts);

      return {
        tag: 'ListInputBlock',
        label,
        labelButton:
          opts_ &&
          opts_.copyFrom &&
          ((opts_.copyFrom!.state && opts_.copyFrom!.state.length > 0) ||
            (opts_.copyFrom!.seed && opts_.copyFrom!.seed.length > 0))
            ? {
                label: opts_.copyFrom.label,
                onClick: () => {
                  const partialState =
                    opts_.copyFrom!.state ||
                    opts_.copyFrom!.seed?.map(s => {
                      const st = template.apply.calculateState({ req, state: null, seed: s });
                      return st;
                    }) ||
                    null;
                  const validation = getValidation(req, partialState);
                  set({
                    ...get,
                    tag: 'InputState',
                    edited: true,
                    partialState,
                    valid: validation.validate(partialState),
                  });
                },
              }
            : undefined,
        required: validation._required,
        value: get.partialState || null,
        visible: opts_?.visible,
        outlined: opts_?.outlined,
        noinline: opts_?.noinline,
        buildEmptyValue: () => template.apply.calculateState({ req, state: null, seed: null }),
        template: (value, onChange) => {
          return template.apply.block({ req, get: value, set: onChange });
        },
        itemLabel: opts_?.itemLabel,
        error: withError(validation.validate(get.partialState), get.edited),
        onChange: (v: RecordState<S, V>[]) => {
          const validation = getValidation(req, v);
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

type ListDynamic<R, S, B> = Dynamic<
  {
    req: R;
    partial: RecordPartial<S>[];
    valid: RecordValidOrNull<S>[];
  },
  B
>;

export type ListInputBlock<S extends object, V> = {
  tag: 'ListInputBlock';
  onChange: (v: RecordState<S, V>[]) => void;
  error: string;
  label?: string;
  labelButton?: { label: string; onClick: () => void };
  value: RecordState<S, V>[] | null;
  visible?: boolean;
  outlined?: boolean;
  noinline?: boolean;
  required?: boolean;
  itemLabel?: string;
  copyFrom?: { getState: RecordState<S, V>[] | null; label: string };
  template: (
    value: RecordState<S, V>,
    onChange: (s: RecordState<S, V>) => void
  ) => RecordInputBlock;
  buildEmptyValue: () => RecordState<S, V>;
};
