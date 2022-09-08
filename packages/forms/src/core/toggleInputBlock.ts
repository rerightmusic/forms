import { right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import {
  create,
  getPartial,
  getValidsOrNull,
  RecordBlockBuilder,
} from './record/recordBlockBuilder';
import { RecordPartial, RecordState, RecordValidOrNull } from './record/recordBlockTypes';
import { RecordInputBlock, RecordNestedInputBlock } from './record/recordInputBlock';

export function toggle<
  R extends object,
  R_ extends object,
  Req extends boolean,
  S extends any[],
  V
>(
  label: string,
  b: (r: RecordBlockBuilder<R, {}, []>) => RecordNestedInputBlock<R & R_, S, V>,
  opts?: ToggleDynamic<
    R,
    S,
    {
      visible?: boolean;
      addLabel?: string;
      removeLabel?: string;
    }
  >
): NestedInputBlock<
  R & R_,
  Req,
  RecordState<S, V> | null,
  RecordPartial<S> | null,
  V | null,
  ToggleInputBlock<S, V>
> {
  const getDyn = (
    req: R & R_,
    state: RecordState<S, V> | null,
    partial?: RecordPartial<S> | null
  ) => ({
    req,
    partial: partial ? partial : state ? getPartial(state.partialState) : null,
    valid: state ? getValidsOrNull(state.partialState) : null,
  });

  const template = b(create());
  return new NestedInputBlock({
    calculateState: ({ req, state, seed }) => {
      const initialState = seed
        ? template.apply.calculateState({
            req,
            state:
              state && state.get.partialState
                ? {
                    get: state.get.partialState,
                    set: x => {
                      state.set({ ...state.get, partialState: x, valid: x.valid });
                    },
                  }
                : null,
            seed,
          })
        : null;
      return {
        tag: 'InputState',
        partialState: initialState,
        edited: state?.get.edited || false,
        valid: initialState ? initialState.valid : right(null),
      };
    },
    block: ({ req, get, set }) => {
      const opts_ = opts && fromDyn(getDyn(req, get.partialState), opts);

      return {
        tag: 'ToggleInputBlock',
        value: get.partialState,
        label,
        visible: opts_?.visible,
        buildEmptyValue: () => template.apply.calculateState({ req, state: null, seed: null }),
        template: (value, onChange) => {
          return template.apply.block({ req, get: value, set: onChange });
        },
        addLabel: opts_?.addLabel,
        removeLabel: opts_?.removeLabel,
        onChange: (v: RecordState<S, V> | null) => {
          set({
            ...get,
            tag: 'InputState',
            edited: true,
            partialState: v,
            valid: v ? v.valid : right(null),
          });
        },
      };
    },
  });
}

type ToggleDynamic<R, S, B> = Dynamic<
  {
    req: R;
    partial: RecordPartial<S> | null;
    valid: RecordValidOrNull<S> | null;
  },
  B
>;

export type ToggleInputBlock<S extends object, V> = {
  tag: 'ToggleInputBlock';
  onChange: (v: RecordState<S, V> | null) => void;
  label: string;
  value: RecordState<S, V> | null;
  visible?: boolean;
  addLabel?: string;
  removeLabel?: string;
  template: (
    value: RecordState<S, V>,
    onChange: (s: RecordState<S, V>) => void
  ) => RecordInputBlock;
  buildEmptyValue: () => RecordState<S, V>;
};
