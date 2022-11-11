import { Either, right } from 'fp-ts/lib/Either';
import _ from 'lodash';
import { camelToSpaced, isTag, isType, mapLeafTypes, recurseReduce, title } from '../../data';
import { Block } from '../block';
import { Dynamic, fromDyn, mapDynamic } from '../dynamic';
import {
  CalculateProps,
  InputState,
  NestedInputBlock,
  ReduceP,
  ReducePS,
  RenderProps,
  StateProps,
} from '../inputBlock';
import { ModalInputBlock } from '../modalInputBlock';
import { OutputBlock, _break } from '../outputBlock';
import { SectionInputBlock } from '../sectionInputBlock';
import { Invalid, invalid, Validator } from '../validator';
import { RecordBlockInterpreter } from './recordBlockInterpreter';
import {
  ExpectPartial,
  ExpectPartialState,
  ExpectValidOrNull,
  RecordKeys,
  RecordPartial,
  RecordPartialState,
  RecordState,
  RecordValid,
  RecordValidOrNull,
} from './recordBlockTypes';
import { RecordNestedInputBlock } from './recordInputBlock';

export const create = <R extends object = {}>() =>
  new RecordBlockBuilder<R, {}, []>({
    tag: 'PartialRecordInputBlock',
    blocks: [],
  });

export class RecordBlockBuilder<R extends object, E extends object, S extends any[]> {
  constructor(readonly apply: PartialRecordInputBlock<R, E, S>) {}

  interpret<B>(
    f: keyof E extends never ? (b: RecordNestedInputBlock<R, S, RecordValid<S>>) => B : never
  ): B {
    return new RecordBlockInterpreter(this.build(v => v)).interpret(f);
  }

  require<R_ extends object>() {
    return new RecordBlockBuilder<R & R_, E, S>(this.apply);
  }

  expect<E_ extends Record<string, [unknown, unknown]>>() {
    return new RecordBlockBuilder<R, E & E_, S>(this.apply);
  }

  break() {
    return this.out(_break());
  }

  keys() {
    return this.apply.blocks.flatMap(b => {
      if (b.tag === 'KeyedChildBlock') return [b.key];
      else if (b.tag === 'SectionChildBlock') {
        return b.keys;
      }
      return [];
    });
  }

  sliceState(
    state: StateProps<RecordPartialState<S>, any, any> | null,
    keys: string[]
  ): StateProps<RecordPartialState<S>, any, any> | null {
    if (state) {
      return {
        get: {
          ...state.get,
          partialState: _.pick(state.get.partialState, keys),
          valid: _.pick(state.get.valid, keys),
        },
        set: x => {
          const newPartial = { ...state.get.partialState, ...x.partialState };
          const valid = validateRecord(newPartial);

          state.set({
            ...state.get,
            ...x,
            partialState: newPartial,
            valid: valid.valid,
          });
        },
      };
    }
    return null;
  }

  sliceRender(
    state: RenderProps<
      R,
      RecordPartialState<S>,
      any,
      {
        showErrors: boolean;
      }
    >,
    keys: string[]
  ): RenderProps<R, Partial<RecordPartialState<S>>, any, any> {
    return {
      ...state,
      ...this.sliceState(state, keys),
    };
  }

  addSection<R_ extends object, E_ extends object, S_ extends any[]>(
    title: string,
    section: RecordDynamic<R, E, S, RecordBlockBuilder<R_, E_, S_>>,
    opts?: {
      divider?: boolean;
    }
  ) {
    return new RecordBlockBuilder<R & R_, E & E_, [...S, ...S_]>({
      ...this.apply,
      blocks: this.apply.blocks.concat(
        mapDynamic(section, b => {
          const x = b.build(v => v);
          return {
            tag: 'SectionChildBlock',
            keys: b.keys(),
            block: new NestedInputBlock<
              R_,
              true,
              RecordPartialState<S_>,
              RecordPartial<S_>,
              RecordValid<S_>,
              SectionInputBlock,
              { showErrors: boolean }
            >({
              ...x.apply,
              block: g => ({
                ...x.apply.block(g),
                tag: 'SectionInputBlock',
                opts,
                title,
              }),
            }),
          };
        })
      ),
    } as PartialRecordInputBlock<R & R_, Omit<E, RecordKeys<S_>> & E_, [...S, ...S_]>);
  }

  addModal<R_ extends object, S_ extends any[]>(
    modal: RecordDynamic<
      R,
      E,
      S,
      NestedInputBlock<
        R_,
        true,
        RecordPartialState<S_>,
        RecordPartial<S_>,
        RecordValid<S_>,
        ModalInputBlock<S_, RecordValid<S_>>,
        { showErrors: boolean }
      >
    >,
    opts?: {
      onChange: (
        value: RecordPartialState<S_>,
        state: RecordPartialState<[...S, ...S_]>
      ) => RecordPartialState<[...S, ...S_]>;
    }
  ) {
    return new RecordBlockBuilder<R & R_, E, [...S, ...S_]>({
      ...this.apply,
      blocks: this.apply.blocks.concat(
        mapDynamic(modal, b => {
          return {
            tag: 'SectionChildBlock',
            keys: b.keys,
            block: new NestedInputBlock<
              R_,
              true,
              RecordPartialState<S_>,
              RecordPartial<S_>,
              RecordValid<S_>,
              ModalInputBlock<S_, RecordValid<S_>>,
              { showErrors: boolean }
            >({
              ...b.apply,
              block: g => b.apply.block(g),
            }),
          };
        })
      ),
    } as PartialRecordInputBlock<R & R_, Omit<E, RecordKeys<S_>>, [...S, ...S_]>);
  }

  addBlocks<R_ extends object, E_ extends object, S_ extends any[]>(
    section: RecordDynamic<R, E, S, RecordBlockBuilder<R_, E_, S_>>
  ) {
    return new RecordBlockBuilder<R & R_, E & E_, [...S, ...S_]>({
      ...this.apply,
      blocks: this.apply.blocks.concat(
        mapDynamic(section, b => {
          const x = b.build(v => v);
          return {
            tag: 'SectionChildBlock',
            keys: b.keys(),
            block: new NestedInputBlock<
              R_,
              true,
              RecordPartialState<S_>,
              RecordPartial<S_>,
              RecordValid<S_>,
              SectionInputBlock,
              { showErrors: boolean }
            >({
              ...x.apply,
              block: g => ({
                ...x.apply.block(g),
                tag: 'SectionInputBlock',
              }),
            }),
          };
        })
      ),
    } as PartialRecordInputBlock<R & R_, Omit<E, RecordKeys<S_>> & E_, [...S, ...S_]>);
  }

  /**
   * If you get unknown type in validation make sure that types of all arguments in the inputBlock line up
   */
  add<
    K extends string,
    Req extends boolean,
    R_ extends R,
    PS,
    BP,
    BV,
    B extends Block,
    Other,
    Type,
    Shape
  >(
    key: K extends RecordKeys<S> ? never : K,
    inputBlock: RecordDynamic<
      R,
      E,
      S,
      NestedInputBlock<R_, Req, PS, BP, BV, B, Other, Type, Shape>
    >,
    opts?: {
      onChange: (value: PS, state: RecordPartialState<S>) => RecordPartialState<S>;
    }
  ) {
    return new RecordBlockBuilder<
      R_,
      K extends keyof E ? Omit<E, K> : E,
      [[K, [Req, ReducePS<Type, PS>, ReduceP<Type, BP>, BV, Other, Type, Shape]], ...S]
    >({
      ...this.apply,
      blocks: this.apply.blocks.concat({
        tag: 'KeyedChildBlock',
        key,
        onChange: opts?.onChange,
        block: inputBlock,
      }),
    } as PartialRecordInputBlock<R_, K extends keyof E ? Omit<E, K> : E, [[K, [Req, ReducePS<Type, PS>, ReduceP<Type, BP>, BV, Other, Type, Shape]], ...S]>);
  }

  out(b: RecordDynamic<R, E, S, OutputBlock>) {
    return new RecordBlockBuilder<R, E, S>({
      ...this.apply,
      blocks: this.apply.blocks.concat(
        mapDynamic(b, b_ => ({ tag: 'OutputChildBlock', block: b_ }))
      ),
    });
  }

  build<V>(
    validate: RecordDynamic<
      R,
      E,
      S,
      (
        v: Validator<true, RecordPartialState<S>, RecordValid<S>>
      ) => Validator<true, RecordPartialState<S>, V>
    >,
    opts?: RecordDynamic<
      R,
      E,
      S,
      {
        visible?: boolean;
        ignore?: boolean;
        label?: string;
      }
    >
  ): RecordNestedInputBlock<R, S, V> {
    const getDyn: (
      req: R,
      partialState: RecordPartialState<S> | null,
      set?: (x: RecordState<S, V>) => void,
      partial?: RecordPartial<S> | null
    ) => RecordDynamicProvided<R, E, S> = (req, partialState, set, partial) => ({
      req,
      state: (partialState as any) || null,
      partial: partial ? partial : getPartial(partialState || ({} as any)),
      valid: getValidsOrNull(partialState || ({} as any)),
      setPartial: (s: RecordPartial<S>) => {
        set ? set(calculateState({ req, seed: s, state: null })) : {};
      },
    });

    const getValidation = (
      req: R,
      s: RecordPartialState<S> | null,
      set?: (x: RecordState<S, V>) => void,
      p?: RecordPartial<S> | null
    ) => {
      return fromDyn(
        getDyn(req, s, set, p),
        validate
      )(
        new Validator<true, RecordPartialState<S>, RecordValid<S>>(true, v => {
          return validateRecord(v).valid;
        })
      );
    };

    const calculateState = ({
      req,
      seed,
      state,
    }: CalculateProps<R, RecordPartialState<S>, RecordPartial<S>, V, { showErrors: boolean }>) => {
      const val = getValidation(req, state?.get.partialState || null, state?.set, seed);
      const dyn = getDyn(
        req,
        state?.get.partialState || null,
        state?.set,
        state?.get?.partialState ? getPartial(state?.get.partialState) : seed
      );
      const opts_ = opts && fromDyn(dyn, opts);
      let objs = this.apply.blocks.reduce(
        (p, b) => {
          const unwrapped = fromDyn(dyn, b);
          if (unwrapped.tag === 'KeyedChildBlock') {
            let state_ = null;
            if (state) {
              const get_ = (state.get.partialState as any)?.[unwrapped.key];
              state_ = {
                get: get_,
                set: (x: any) => {
                  let newState = { ...state!.get.partialState, [unwrapped.key]: x };
                  if (unwrapped.onChange) {
                    newState = unwrapped.onChange(x, {
                      ...state!.get.partialState,
                      [unwrapped.key]: x,
                    });
                  }
                  state!.set({
                    ...state!.get,
                    partialState: newState,
                    valid: val.validate(newState),
                  });
                },
              };
            }

            const seed_ = (seed as any)?.[unwrapped.key];
            const st = fromDyn(dyn, unwrapped.block).apply.calculateState({
              req,
              seed: seed_ === undefined ? null : seed_,
              state: state_,
            });
            return {
              edited: p.edited === true ? true : st.edited,
              partialState: {
                ...p.partialState,
                [unwrapped.key]: st,
              },
            };
          } else if (unwrapped.tag === 'SectionChildBlock') {
            const st = unwrapped.block.apply.calculateState({
              req,
              state: this.sliceState(state, unwrapped.keys),
              seed,
            });
            return {
              edited: p.edited === true ? true : st.edited,
              partialState: {
                ...p.partialState,
                ...st.partialState,
              },
            };
          }
          return p;
        },
        { partialState: {} as any, edited: false }
      );

      let currState = {
        tag: 'InputState',
        partialState: objs.partialState,
        edited: objs.edited,
        valid: val.validate(objs.partialState),
        ignore: opts_?.ignore,
        visible: opts_?.visible,
        showErrors: state?.get.showErrors !== undefined ? state.get.showErrors : false,
      } as RecordState<S, V>;

      if (!state) {
        currState = calculateState({
          req,
          seed,
          state: { get: currState, set: () => {} },
        });
      }

      return currState;
    };

    return new NestedInputBlock({
      calculateState,
      block: ({ req, set, get, showErrors: showErrors_ }) => {
        const dyn = getDyn(req, get.partialState, set);
        const opts_ = opts && fromDyn(dyn, opts);
        const showErrors = showErrors_ || (get as any).showErrors === true;

        return {
          tag: 'RecordInputBlock',
          label: opts_?.label,
          visible: opts_?.visible,
          blocks: this.apply.blocks.flatMap(b => {
            const unwrapped = fromDyn(dyn, b);
            if (unwrapped.tag === 'KeyedChildBlock') {
              const block = fromDyn(dyn, unwrapped.block).apply.block({
                showErrors,
                req: req,
                get: (get.partialState as any)[unwrapped.key],
                set: s => {
                  let latestState = calculateState({
                    req,
                    seed: null,
                    state: {
                      get: { ...get, partialState: { ...get.partialState, [unwrapped.key]: s } },
                      set: x =>
                        set({
                          ...get,
                          partialState: { ...get.partialState, [unwrapped.key]: x },
                          valid: val.validate({ ...get.partialState, [unwrapped.key]: x }),
                        }),
                    },
                  });

                  // We need to override unwrapped.key value in latestState because
                  // it is what we are trying to set here. It's calculation value will
                  // be off of the previous data and it won't be the most up to date
                  latestState = {
                    ...latestState,
                    partialState: {
                      ...get.partialState,
                      ...latestState.partialState,
                      [unwrapped.key]: s,
                    },
                  };

                  const val = getValidation(req, latestState.partialState);
                  const valid = val.validate(latestState.partialState);

                  set({
                    ...get,
                    tag: 'InputState',
                    edited: get.edited || s.edited,
                    partialState: latestState.partialState,
                    valid,
                    ignore: opts_?.ignore,
                    showErrors,
                  });
                },
              });

              if (block.visible === false) {
                return [];
              } else return [block];
            } else if (unwrapped.tag === 'SectionChildBlock') {
              const block = unwrapped.block.apply.block(
                this.sliceRender({ req, set, get, showErrors }, unwrapped.keys)
              );
              if (block.visible === false) return [];
              return [block];
            }

            if ((unwrapped.block as any).visible === false) {
              return [];
            }
            return [unwrapped.block];
          }),
        };
      },
    });
  }
}

type PartialRecordInputBlock<R, E, S> = {
  tag: 'PartialRecordInputBlock';
  blocks: PartialRecordInputChildBlock<R, E, S>[];
};

type PartialRecordInputChildBlock<R, E, S> =
  | KeyedChildBlock<R, E, S>
  | RecordDynamic<R, E, S, OutputChildBlock>
  | RecordDynamic<R, E, S, SectionChildBlock>;

type KeyedChildBlock<R, E, S> = {
  tag: 'KeyedChildBlock';
  key: string;
  onChange?: (value: any, state: RecordPartialState<S>) => RecordPartialState<S>;
  block: RecordDynamic<R, E, S, NestedInputBlock<any, any, any, any, any, any, any>>;
};

type SectionChildBlock = {
  tag: 'SectionChildBlock';
  keys: string[];
  block: NestedInputBlock<any, any, any, any, any, any, any>;
};

type OutputChildBlock = {
  tag: 'OutputChildBlock';
  block: OutputBlock;
};

type RecordDynamicProvided<R, E, S> = {
  setPartial: (s: RecordPartial<S>) => void;
  req: R;
  state: (RecordPartialState<S> & ExpectPartialState<E>) | null;
  partial: RecordPartial<S> & ExpectPartial<E>;
  valid: RecordValidOrNull<S> & ExpectValidOrNull<E>;
};

type RecordDynamic<R, E, S, B> = Dynamic<RecordDynamicProvided<R, E, S>, B>;

export const printErrors = (errs: Record<string, any>) => {
  return `Some fields are invalid: ${printErrors_(errs)}`;
};

export const printErrors_ = (errs: any[] | Record<string, any> | string): string => {
  if (_.isArray(errs)) {
    return errs
      .map((e, idx) => {
        const err = printErrors_(e);
        return `${idx}${err ? ` - ${err}` : ''}`;
      })
      .join(', ');
  }
  if (_.isObject(errs)) {
    return _.reduce(
      errs,
      (prev, next, key) => {
        const err = printErrors_(next);
        return prev.concat(`${title(camelToSpaced(key))}${err ? ` · ${err}` : ''}`);
      },
      [] as string[]
    ).join(', ');
  }
  return '';
};

export const validateRecord = <S>(
  p: RecordPartialState<S>
): { valid: Either<Invalid, RecordValid<S>>; errors: Record<string, string> } => {
  const { record: errors } = recurseReduce(
    p,
    {
      if: isTag<InputState<unknown, unknown, unknown>>('InputState'),
      recurse: x => (x.ignore ? undefined : x.partialState),
    },
    (_state, v, _, ignore) => {
      const isIgnored =
        (v._tag === 'Left' && v.left.parent.ignore === true) ||
        (v._tag === 'Right' && v.right.ignore === true);
      const res = v._tag === 'Left' ? v.left.parent.valid : v.right.valid;
      return {
        value: isIgnored ? ignore : res._tag === 'Left' ? res.left.error : ignore,
        state: {},
      };
    },
    {}
  );

  const { record: valid } = recurseReduce(
    p,
    { if: isTag<InputState<unknown, unknown, unknown>>('InputState') },
    (_state, v, _, ignore) => {
      const res = v._tag === 'Left' ? v.left.parent.valid : v.right.valid;
      return {
        value: res._tag === 'Right' ? res.right : ignore,
        state: {},
      };
    },
    {}
  );

  if (_.size(errors) > 0) {
    return {
      valid: invalid(printErrors(errors), 'edited'),
      errors,
    };
  }
  return { valid: right(valid as RecordValid<S>), errors };
};

export const getValidsOrNull = <S>(ps: RecordPartialState<S>) => {
  return mapLeafTypes(
    ps,
    isType<InputState<any, any, any>>(
      v => typeof v === 'object' && 'tag' in v && v.tag === 'InputState'
    ),
    v => (v.valid._tag === 'Right' ? v.valid.right : null)
  );
};

export const getPartial = (ps: any): any => {
  return mapLeafTypes(
    ps,
    isType<InputState<any, any, any>>(
      v => typeof v === 'object' && 'tag' in v && v.tag === 'InputState'
    ),
    v => getPartial(v.partialState)
  );
};
