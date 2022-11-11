import { Dynamic, fromDyn } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { getPartial, getValidsOrNull, RecordBlockBuilder } from './record/recordBlockBuilder';
import {
  RecordPartial,
  RecordPartialState,
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
      ignore?: boolean;
      inline?: boolean;
      modalLabelLines?: string[];
      mode?:
        | {
            type: 'inline';
            resultLabel?: string;
          }
        | {
            type: 'multiline';
            resultLabelLines?: string[];
          };
      editLabel?: string;
      primaryButton?: {
        label?: string;
        onClick?: () => void;
      };
      secondaryButton?: {
        label?: string;
        onClick?: () => void;
      };
    }
  >
): NestedInputBlock<
  R,
  true,
  RecordPartialState<S>,
  RecordPartial<S>,
  RecordValid<S>,
  ModalInputBlock<S, RecordValid<S>>,
  { showErrors: boolean }
> {
  const getDyn = (
    req: R,
    state: RecordPartialState<S> | null,
    partial?: RecordPartial<S> | null
  ) => ({
    req,
    partial: partial ? partial : state ? getPartial(state) : {},
    valid: state ? getValidsOrNull(state) : {},
  });

  const template = b.build(v => v);
  return new NestedInputBlock(
    {
      calculateState: ({ req, state, seed }) => {
        const opts_ = opts && fromDyn(getDyn(req, state?.get.partialState || null, seed), opts);
        const initialState = template.apply.calculateState({
          req,
          state: state
            ? {
                get: state.get,
                set: x => {
                  state.set({ ...state.get, ...x, valid: x.valid });
                },
              }
            : null,
          seed,
        });
        return {
          ...initialState,
          edited: state?.get.edited || false,
          ignore: opts_?.ignore,
          valid: initialState.valid,
        };
      },
      block: ({ req, get, set, showErrors }) => {
        const opts_ = opts && fromDyn(getDyn(req, get.partialState), opts);
        return {
          tag: 'ModalInputBlock',
          value: get,
          label,
          visible: opts_?.visible,
          inline: opts_?.inline,
          buildEmptyValue: () => template.apply.calculateState({ req, state: null, seed: null }),
          template: (value, onChange) => {
            return template.apply.block({ req, get: value, set: onChange, showErrors });
          },
          editLabel: opts_?.editLabel,
          modalLabelLines: opts_?.modalLabelLines,
          primaryButton: opts_?.primaryButton,
          secondaryButton: opts_?.secondaryButton,
          mode: opts_?.mode,
          onChange: (v: RecordState<S, RecordValid<S>>) => {
            set({
              ...get,
              ...v,
              edited: true,
              valid: v.valid,
            });
          },
        };
      },
    },
    b.keys()
  );
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
  inline?: boolean;
  editLabel?: string;
  mode?:
    | {
        type: 'inline';
        resultLabel?: string;
      }
    | {
        type: 'multiline';
        resultLabelLines?: string[];
      };
  primaryButton?: {
    label?: string;
    onClick?: () => void;
  };
  secondaryButton?: {
    label?: string;
    onClick?: () => void;
  };
  modalLabelLines?: string[];
  template: (
    value: RecordState<S, RecordValid<S>>,
    onChange: (s: RecordState<S, RecordValid<S>>) => void
  ) => RecordInputBlock;
  buildEmptyValue: () => RecordState<S, RecordValid<S>>;
};
