import { toDate } from '../data';
import { formatISO, isValid } from 'date-fns';
import { right } from 'fp-ts/lib/Either';
import { Dynamic, fromDyn, mapDynamic } from './dynamic';
import { NestedInputBlock } from './inputBlock';
import { invalid, Validator, withError } from './validator';

export function year<R, Req extends boolean, V>(
  label: Dynamic<Date | null, string>,
  validate: Dynamic<
    Date | null,
    (v: Validator<false, Date | null, number | null>) => Validator<Req, Date | null, V>
  >,
  opts?: {
    maxDate?: Date;
  }
): NestedInputBlock<R, Req, Date | null, number | null, V, DateInputBlock, {}> {
  return date(
    label,
    mapDynamic(validate, d => (v: Validator<false, Date | null, string | null>) => {
      return v
        .andThen(p => {
          return right(p ? parseInt(p) : null);
        })
        .chain(d);
    }),
    { ...opts, yearOnly: true }
  ).mapSeed(p => (p ? p.toString() : null));
}

export function date<R, Req extends boolean, V>(
  label: Dynamic<Date | null, string>,
  validate: Dynamic<
    Date | null,
    (v: Validator<false, Date | null, string | null>) => Validator<Req, Date | null, V>
  >,
  opts?: {
    yearOnly?: boolean;
    maxDate?: Date;
  }
): NestedInputBlock<R, Req, Date | null, string | null, V, DateInputBlock, {}> {
  const getValidation = (prov: Date | null) =>
    new Validator<false, Date | null, string | null>(
      false,
      v => {
        if (v && isValid(v)) {
          if (v.getFullYear() > 1899) {
            return right(formatISO(v).substring(0, 10).replace(/\//g, '-'));
          } else {
            return invalid('Date year needs to be 1900 or greater', 'edited');
          }
        } else if (v === null) {
          return right(null);
        } else {
          return invalid('Date is invalid', 'edited');
        }
      },
      p => p === null
    ).chain(fromDyn(prov, validate));

  return new NestedInputBlock({
    calculateState: ({ seed, state }) => {
      const date = state?.get.partialState || (seed ? toDate(seed) : null);
      const validation = getValidation(date);
      return {
        tag: 'InputState',
        partialState: date || validation._default,
        edited: state?.get.edited || false,
        valid: validation.validate(date),
      };
    },
    block: ({ get, set, showErrors }) => {
      const validation = getValidation(get.partialState || null);
      return {
        tag: 'DateInputBlock',
        label: fromDyn(get.partialState || null, label),
        value: get.partialState || null,
        required: validation._required,
        error: withError(validation.validate(get.partialState), get.edited, showErrors),
        yearOnly: opts?.yearOnly,
        maxDate: opts?.maxDate,
        onChange: (v: Date | null) => {
          set({
            ...get,
            tag: 'InputState',
            edited: true,
            partialState: v,
            valid: getValidation(v).validate(v),
          });
        },
      };
    },
  });
}

export type DateInputBlock = {
  tag: 'DateInputBlock';
  onChange: (v: Date | null) => void;
  required: boolean;
  error: string;
  label: string;
  value: Date | null;
  yearOnly?: boolean;
  maxDate?: Date;
};
