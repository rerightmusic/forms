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
  RecordState,
  RecordValid,
  RecordValidOrNull,
} from './record/recordBlockTypes';
import { RecordInputBlock } from './record/recordInputBlock';

export function modal<R extends object, S extends any[]>(
  label: string,
  b: RecordBlockBuilder<R, {}, S>,
  opts?: ModalDynamic<
    R,
    S,
    {
      visible?: boolean;
      modalLabelLines?: string[];
      resultLabelLines?: string[];
      editLabel?: string;
    }
  >
): NestedInputBlock<
  R,
  true,
  RecordState<S, RecordValid<S>>,
  RecordPartial<S>,
  RecordValid<S>,
  ModalInputBlock<S, RecordValid<S>>,
  {}
> {
  const getDyn = (req: R, state: RecordState<S, RecordValid<S>>, partial?: RecordPartial<S>) => ({
    req,
    partial: partial ? partial : state ? getPartial(state.partialState) : null,
    valid: state ? getValidsOrNull(state.partialState) : null,
  });

  const template = b.build(v => v);
  return new NestedInputBlock({
    calculateState: ({ req, state, seed }) => {
      const initialState = template.apply.calculateState({
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
        valid: initialState.valid,
      };
    },
    block: ({ req, get, set, showErrors }) => {
      const opts_ = opts && fromDyn(getDyn(req, get.partialState), opts);

      return {
        tag: 'ModalInputBlock',
        value: get.partialState,
        label,
        visible: opts_?.visible,
        buildEmptyValue: () => template.apply.calculateState({ req, state: null, seed: null }),
        template: (value, onChange) => {
          return template.apply.block({ req, get: value, set: onChange, showErrors });
        },
        editLabel: opts_?.editLabel,
        modalLabelLines: opts_?.modalLabelLines,
        resultLabelLines: opts_?.resultLabelLines,
        onChange: (v: RecordState<S, RecordValid<S>>) => {
          set({
            ...get,
            tag: 'InputState',
            edited: true,
            partialState: v,
            valid: v.valid,
          });
        },
      };
    },
  });
}

type ModalDynamic<R, S, B> = Dynamic<
  {
    req: R;
    partial: RecordPartial<S>;
    valid: RecordValidOrNull<S>;
  },
  B
>;

export type ModalInputBlock<S extends any[], V> = {
  tag: 'ModalInputBlock';
  onChange: (v: RecordState<S, RecordValid<S>>) => void;
  label: string;
  value: RecordState<S, RecordValid<S>>;
  visible?: boolean;
  editLabel?: string;
  modalLabelLines?: string[];
  resultLabelLines?: string[];
  template: (
    value: RecordState<S, RecordValid<S>>,
    onChange: (s: RecordState<S, RecordValid<S>>) => void
  ) => RecordInputBlock;
  buildEmptyValue: () => RecordState<S, RecordValid<S>>;
};
