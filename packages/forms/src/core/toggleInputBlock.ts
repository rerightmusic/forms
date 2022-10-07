import { right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { getPartial, getValidsOrNull, RecordBlockBuilder } from './record/recordBlockBuilder';
import {
  RecordPartial,
  RecordState,
  RecordValid,
  RecordValidOrNull,
} from './record/recordBlockTypes';
import { RecordInputBlock } from './record/recordInputBlock';

export function toggle<R extends object, R_ extends object, S extends any[]>(
  label: string,
  b: RecordBlockBuilder<R, {}, S>,
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
  true,
  RecordState<S, RecordValid<S>> | null,
  RecordPartial<S> | null,
  RecordValid<S> | null,
  ToggleInputBlock<S, RecordValid<S>>,
  {}
> {
  const getDyn = (
    req: R & R_,
    state: RecordState<S, RecordValid<S>> | null,
    partial?: RecordPartial<S> | null
  ) => ({
    req,
    partial: partial ? partial : state ? getPartial(state.partialState) : null,
    valid: state ? getValidsOrNull(state.partialState) : null,
  });

  const template = b.build(v => v);
  return new NestedInputBlock({
    calculateState: ({ req, state, seed }) => {
      const initialState =
        !state?.get.partialState && seed === null
          ? null
          : template.apply.calculateState({
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
            });
      return {
        tag: 'InputState',
        partialState: initialState,
        edited: state?.get.edited || false,
        valid: initialState ? initialState.valid : right(null),
      };
    },
    block: ({ req, get, set, showErrors }) => {
      const opts_ = opts && fromDyn(getDyn(req, get.partialState), opts);

      return {
        tag: 'ToggleInputBlock',
        value: get.partialState,
        label,
        visible: opts_?.visible,
        buildEmptyValue: () => template.apply.calculateState({ req, state: null, seed: null }),
        template: (value, onChange) => {
          return template.apply.block({ req, get: value, set: onChange, showErrors });
        },
        addLabel: opts_?.addLabel,
        removeLabel: opts_?.removeLabel,
        onChange: (v: RecordState<S, RecordValid<S>> | null) => {
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

export type ToggleInputBlock<S extends any[], V> = {
  tag: 'ToggleInputBlock';
  onChange: (v: RecordState<S, RecordValid<S>> | null) => void;
  label: string;
  value: RecordState<S, RecordValid<S>> | null;
  visible?: boolean;
  addLabel?: string;
  removeLabel?: string;
  template: (
    value: RecordState<S, RecordValid<S>>,
    onChange: (s: RecordState<S, RecordValid<S>>) => void
  ) => RecordInputBlock;
  buildEmptyValue: () => RecordState<S, RecordValid<S>>;
};
