import { right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import {
  create,
  getPartial,
  getValidsOrNull,
  RecordBlockBuilder,
} from './record/recordBlockBuilder';
import {
  RecordPartial,
  RecordPartialState,
  RecordState,
  RecordValid,
  RecordValidOrNull,
} from './record/recordBlockTypes';
import { RecordInputBlock } from './record/recordInputBlock';
import { invalid, Validator, withError } from './validator';

export function list<R extends object, Req extends boolean, S extends any[], V>(
  label: string,
  b: RecordBlockBuilder<R, {}, S>,
  validate: ListDynamic<
    R,
    S,
    (
      v: Validator<false, RecordState<S, RecordValid<S>>[] | null, RecordValid<S>[] | null>
    ) => Validator<Req, RecordState<S, RecordValid<S>>[] | null, V>
  >,
  opts?: ListDynamic<
    R,
    S,
    {
      minItems?: number;
      createEmpty?: number;
      maxItems?: number;
      itemLabel?: string;
      visible?: boolean;
      outlined?: boolean;
      noinline?: boolean;
      ignore?: boolean;
      onEdit?: (
        item: RecordState<S, RecordValid<S>>,
        state: RecordState<S, RecordValid<S>>[]
      ) => RecordState<S, RecordValid<S>>[];
      copyFrom?: {
        state?: RecordState<S, RecordValid<S>>[];
        seed?: RecordPartial<S>[];
        label: string;
      };
    }
  >
): NestedInputBlock<
  R,
  Req,
  RecordState<S, RecordValid<S>>[] | null,
  RecordPartial<S>[],
  V,
  ListInputBlock<S, V>,
  {},
  'array',
  S
> {
  const getDyn = (
    req: R,
    state: RecordState<S, RecordValid<S>>[] | null,
    partial?: RecordPartial<S>[] | null
  ) => ({
    req,
    partial: partial
      ? partial
      : (state || []).map<RecordPartial<S>>(s => getPartial(s.partialState)),
    valid: (state || []).map<RecordValidOrNull<S>>(s => getValidsOrNull(s.partialState)),
  });

  const getValidation = (
    req: R,
    state: RecordState<S, RecordValid<S>>[] | null,
    partial?: RecordPartial<S>[] | null
  ) => {
    const p = getDyn(req, state, partial);
    const opts_ = opts && fromDyn(getDyn(req, state), opts);
    return new Validator<false, RecordState<S, RecordValid<S>>[] | null, RecordValid<S>[] | null>(
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
  const template = b.build(v => v);
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
          const s = (x: RecordState<S, RecordValid<S>>) => {
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
    block: ({ req, get, set, showErrors }) => {
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
        createEmpty: opts_?.createEmpty,
        outlined: opts_?.outlined,
        noinline: opts_?.noinline,
        buildEmptyValue: () => template.apply.calculateState({ req, state: null, seed: null }),
        template: (value, onChange) => {
          return template.apply.block({
            req,
            get: value,
            set: onChange,
            showErrors,
          });
        },
        itemLabel: opts_?.itemLabel,
        error: withError(validation.validate(get.partialState), get.edited, showErrors),
        onChange: (v, change) => {
          let v_ = v;
          if (opts_?.onEdit && change.value) {
            v_ = opts_.onEdit(change.value, v);
          }
          const validation = getValidation(req, v_);
          set({
            ...get,
            tag: 'InputState',
            edited: true,
            partialState: v_,
            valid: validation.validate(v_),
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

export type ListInputBlock<S extends any[], V> = {
  tag: 'ListInputBlock';
  onChange: (
    v: RecordState<S, RecordValid<S>>[],
    change: { type: 'edit' | 'delete' | 'add'; value?: RecordState<S, RecordValid<S>> }
  ) => void;
  error: string;
  label?: string;
  labelButton?: { label: string; onClick: () => void };
  value: RecordState<S, RecordValid<S>>[] | null;
  visible?: boolean;
  outlined?: boolean;
  createEmpty?: number;
  noinline?: boolean;
  required?: boolean;
  itemLabel?: string;
  copyFrom?: { getState: RecordState<S, RecordValid<S>>[] | null; label: string };
  template: (
    value: RecordState<S, RecordValid<S>>,
    onChange: (s: RecordState<S, RecordValid<S>>) => void
  ) => RecordInputBlock;
  buildEmptyValue: () => RecordState<S, RecordValid<S>>;
};
