import { right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn } from './dynamic';
import { InputState, NestedInputBlock, RenderProps } from './inputBlock';
import { Validator, withError } from './validator';

export function value<R, Req extends boolean, V, V_>(
  value: V,
  validate: Dynamic<V, (v: Validator<false, V, V>) => Validator<Req, V, V_>>,
  opts?: Dynamic<
    V,
    {
      visible?: { label: string; edited: boolean };
      ignore?: boolean;
    }
  >
): NestedInputBlock<R, Req, V, null, V_, ValueInputBlock<V>, {}> {
  const getValidation = (prov: V) =>
    new Validator<false, V, V>(
      false,
      v => right(v),
      p => p === null || (typeof p === 'string' && p === '')
    ).chain(fromDyn(prov, validate));

  return new NestedInputBlock({
    calculateState: () => {
      const validation = getValidation(value);
      const opts_ = opts && fromDyn(value, opts);
      const edited = opts_?.visible?.edited !== undefined ? opts_?.visible.edited : false;
      return {
        tag: 'InputState',
        partialState: value,
        ignore: opts_?.ignore,
        edited,
        valid: validation.validate(value),
      };
    },
    block: ({ get, set, showErrors }: RenderProps<R, V, V_, {}>) => {
      const validation = getValidation(value);
      const valid = validation.validate(value);
      const opts_ = opts && fromDyn(get.partialState, opts);
      const edited = opts_?.visible?.edited !== undefined ? opts_?.visible.edited : false;
      if (get.partialState !== value || opts_?.ignore !== get.ignore || edited !== get.edited) {
        set({
          ...get,
          ignore: opts_?.ignore,
          partialState: value,
          valid,
          edited,
        });
      }
      return {
        tag: 'ValueInputBlock',
        value: get.partialState,
        visible: opts_?.visible ? true : false,
        label: opts_?.visible?.label,
        error: withError(valid, edited, showErrors),
        required: validation._required,
      };
    },
  });
}

export type ValueInputBlock<V> = {
  tag: 'ValueInputBlock';
  value: V;
  label?: string;
  error?: string;
  required: boolean;
  visible?: boolean;
};
