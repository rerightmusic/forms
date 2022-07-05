import { camelToSpaced, isType, mapLeafTypes, mapReduceLeafTypes, title } from '../../data';
import { Either, right } from 'fp-ts/lib/Either';
import { Block } from '../block';
import { Dynamic, fromDyn, mapDynamic } from '../dynamic';
import { CalculateProps, InputBlockTypes, InputState, NestedInputBlock } from '../inputBlock';
import { OutputBlock, _break } from '../outputBlock';
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
import { RecordNestedInputBlock, SectionInputBlock } from './recordInputBlock';

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
            block: new NestedInputBlock<
              R_,
              true,
              RecordPartialState<S_>,
              RecordPartial<S_>,
              RecordValid<S_>,
              SectionInputBlock
            >({
              ...x.apply,
              block: g => ({
                tag: 'SectionInputBlock',
                divider: opts?.divider,
                title,
                block: x.apply.block(g),
              }),
            }),
          };
        })
      ),
    } as PartialRecordInputBlock<R & R_, Omit<E, RecordKeys<S_>> & E_, [...S, ...S_]>);
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
            block: new NestedInputBlock<
              R_,
              true,
              RecordPartialState<S_>,
              RecordPartial<S_>,
              RecordValid<S_>,
              SectionInputBlock
            >({
              ...x.apply,
              block: g => ({
                tag: 'SectionInputBlock',
                block: x.apply.block(g),
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
  add<K extends string, Req extends boolean, R_ extends R, PS, BP, BV, B extends Block>(
    key: K extends RecordKeys<S> ? never : K,
    inputBlock: RecordDynamic<R, E, S, NestedInputBlock<R_, Req, PS, BP, BV, B>>
  ) {
    return new RecordBlockBuilder<
      R_,
      K extends keyof E ? Omit<E, K> : E,
      [[K, InputBlockTypes<Req, PS, BP, BV>], ...S]
    >({
      ...this.apply,
      blocks: this.apply.blocks.concat(
        mapDynamic(inputBlock, b => ({ tag: 'KeyedChildBlock', key, block: b }))
      ),
    } as PartialRecordInputBlock<R_, K extends keyof E ? Omit<E, K> : E, [[K, InputBlockTypes<Req, PS, BP, BV>], ...S]>);
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
    const getValidation = (
      req: R,
      s: RecordPartialState<S> | null,
      p?: RecordPartial<S> | null
    ) => {
      return fromDyn(
        {
          req: req,
          state: s as any,
          partial: p ? p : s ? getPartial(s) : {},
          valid: s ? getValidsOrNull(s) : {},
        },
        validate
      )(
        new Validator<true, RecordPartialState<S>, RecordValid<S>>(true, v => {
          return validateRecord(v);
        })
      );
    };

    const getDyn = (req: R, state: RecordState<S, V> | null, partial?: RecordPartial<S> | null) =>
      ({
        req,
        state: (state?.partialState as any) || null,
        partial: partial ? partial : getPartial(state?.partialState || ({} as any)),
        valid: getValidsOrNull(state?.partialState || ({} as any)),
      } as RecordDynamicProvided<R, E, S>);

    const calculateState = ({
      req,
      seed,
      get,
    }: CalculateProps<R, RecordPartialState<S>, RecordPartial<S>, V>) => {
      const val = getValidation(req, get?.partialState || null, seed);
      const dyn = getDyn(req, get, get?.partialState ? getPartial(get.partialState) : seed);
      const opts_ = opts && fromDyn(dyn, opts);
      const objs = this.apply.blocks.reduce(
        (p, b) => {
          const unwrapped = fromDyn(dyn, b);
          if (unwrapped.tag === 'KeyedChildBlock') {
            const get_ = (get?.partialState as any)?.[unwrapped.key];
            const seed_ = (seed as any)?.[unwrapped.key];
            const st = unwrapped.block.apply.calculateState({
              req,
              seed: seed_,
              get: get_ !== undefined && get_ !== null ? get_ : null,
            });
            return {
              edited: p.edited === true ? true : st.edited,
              partialState: {
                ...p.partialState,
                [unwrapped.key]: st,
              },
            };
          } else if (unwrapped.tag === 'SectionChildBlock') {
            const st = unwrapped.block.apply.calculateState({ req, get, seed });
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

      return {
        tag: 'InputState',
        partialState: objs.partialState,
        edited: objs.edited,
        valid: val.validate(objs.partialState),
        ignore: opts_?.ignore,
        visible: opts_?.visible,
      } as InputState<RecordPartialState<S>, V>;
    };

    return new NestedInputBlock({
      calculateState,
      block: ({ req, set, get }) => {
        const dyn = getDyn(req, get);
        const opts_ = opts && fromDyn(dyn, opts);

        return {
          tag: 'RecordInputBlock',
          label: opts_?.label,
          visible: opts_?.visible,
          blocks: this.apply.blocks.flatMap(b => {
            const unwrapped = fromDyn(dyn, b);
            if (unwrapped.tag === 'KeyedChildBlock') {
              const block = unwrapped.block.apply.block({
                req: req,
                get: (get.partialState as any)[unwrapped.key],
                set: s => {
                  let latestState = calculateState({
                    req,
                    seed: null,
                    get: { ...get, partialState: { ...get.partialState, [unwrapped.key]: s } },
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

                  set({
                    ...get,
                    tag: 'InputState',
                    edited: get.edited || s.edited,
                    partialState: latestState.partialState,
                    valid: val.validate(latestState.partialState),
                    ignore: opts_?.ignore,
                  });
                },
              });

              if (block.visible === false) {
                return [];
              } else return [block];
            } else if (unwrapped.tag === 'SectionChildBlock') {
              const block = unwrapped.block.apply.block({ req, set, get });
              if (block.block.visible === false) return [];
              return [block];
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
  blocks: RecordDynamic<R, E, S, PartialRecordInputChildBlock>[];
};

type PartialRecordInputChildBlock = KeyedChildBlock | OutputChildBlock | SectionChildBlock;
type KeyedChildBlock = {
  tag: 'KeyedChildBlock';
  key: string;
  block: NestedInputBlock<any, any, any, any, any, any>;
};

type SectionChildBlock = {
  tag: 'SectionChildBlock';
  block: NestedInputBlock<any, any, any, any, any, SectionInputBlock>;
};

type OutputChildBlock = {
  tag: 'OutputChildBlock';
  block: OutputBlock;
};

type RecordDynamicProvided<R, E, S> = {
  req: R;
  state: (RecordPartialState<S> & ExpectPartialState<E>) | null;
  partial: RecordPartial<S> & ExpectPartial<E>;
  valid: RecordValidOrNull<S> & ExpectValidOrNull<E>;
};

type RecordDynamic<R, E, S, B> = Dynamic<RecordDynamicProvided<R, E, S>, B>;

export const validateRecord = <S>(p: RecordPartialState<S>): Either<Invalid, RecordValid<S>> => {
  const { state, value } = mapReduceLeafTypes(
    p,
    isType<InputState<any, any>>(
      v => typeof v === 'object' && 'tag' in v && v.tag === 'InputState'
    ),
    [] as string[],
    (v, state, key) => {
      if (v.ignore === true) {
        return { value: undefined, state };
      }
      return v.valid._tag === 'Right'
        ? { value: v.valid.right, state }
        : { value: undefined, state: state.concat([key]) };
    }
  );

  if (state.length > 0) {
    return invalid(
      `Some fields are invalid ${state
        .map(x => `"${title(camelToSpaced(x.slice(1)))}"`)
        .join(', ')}`,
      'edited'
    );
  }
  return right(value);
};

export const getValidsOrNull = <S>(ps: RecordPartialState<S>) => {
  return mapLeafTypes(
    ps,
    isType<InputState<any, any>>(
      v => typeof v === 'object' && 'tag' in v && v.tag === 'InputState'
    ),
    v => (v.valid._tag === 'Right' ? v.valid.right : null)
  );
};

export const getPartial = (ps: any): any => {
  return mapLeafTypes(
    ps,
    isType<InputState<any, any>>(
      v => typeof v === 'object' && 'tag' in v && v.tag === 'InputState'
    ),
    v => getPartial(v.partialState)
  );
};
