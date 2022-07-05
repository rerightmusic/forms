import { InputBlockTypes, InputState } from '../inputBlock';
import { RecordBlockBuilder } from './recordBlockBuilder';

export type RecordState<S extends object, V> = InputState<RecordPartialState<S>, V>;
export type RecordStateValue<S extends object, V> = InputState<RecordPartialState<S>, V>;

export type ExpectPartial<S> = {
  [P in keyof S]?: S[P] extends [infer P, infer _V]
    ? P
    : S[P] extends Array<infer U>
    ? ExpectPartial<U>[]
    : S[P] extends object
    ? ExpectPartial<S[P]>
    : unknown;
};

export type ExpectValidOrNull<S> = {
  [P in keyof S]: S[P] extends [infer _P, infer V]
    ? V | null
    : S[P] extends Array<infer U>
    ? ExpectValidOrNull<U>[]
    : S[P] extends object
    ? ExpectValidOrNull<S[P]>
    : unknown;
};

export type ExpectPartialState<S> = {
  [P in keyof S]: S[P] extends [infer P, infer V]
    ? InputState<P, V>
    : S[P] extends Array<infer U>
    ? ExpectPartialState<U>[]
    : S[P] extends object
    ? ExpectPartialState<S[P]>
    : unknown;
};

export type RecordPartial<S> = S extends [infer Head, ...infer Tail]
  ? RecordPartialOne<Head> & RecordPartial<Tail>
  : {};

type RecordPartialOne<H> = H extends [infer K, infer IB]
  ? K extends string
    ? IB extends InputBlockTypes<infer _Req, infer _PS, null, infer _V>
      ? {}
      : IB extends InputBlockTypes<infer _Req, infer _PS, infer P, infer _V>
      ? { [k in K]?: P }
      : never
    : never
  : never;

export type RecordPartialState<S> = S extends [infer Head, ...infer Tail]
  ? RecordPartialStateOne<Head> & RecordPartialState<Tail>
  : {};

type RecordPartialStateOne<H> = H extends [infer K, infer IB]
  ? K extends string
    ? IB extends InputBlockTypes<infer _Req, infer PS, infer _P, infer V>
      ? { [k in K]: InputState<PS, V> }
      : never
    : never
  : never;

export type RecordValid<S> = S extends [infer Head, ...infer Tail]
  ? RecordValidOne<Head> & RecordValid<Tail>
  : {};

type RecordValidOne<H> = H extends [infer K, infer IB]
  ? K extends string
    ? IB extends InputBlockTypes<infer Req, infer _PS, infer _P, infer V>
      ? { [k in K]: Req extends true ? V : V | null }
      : never
    : never
  : never;

export type RecordValidOrNull<S> = S extends [infer Head, ...infer Tail]
  ? RecordValidOrNullOne<Head> & RecordValidOrNull<Tail>
  : {};

type RecordValidOrNullOne<H> = H extends [infer K, infer IB]
  ? K extends string
    ? IB extends InputBlockTypes<infer _Req, infer _PS, infer _P, infer V>
      ? { [k in K]: V | null }
      : never
    : never
  : never;

export type RecordKeys<S> = S extends [infer Head, ...infer Tail]
  ? RecordKeysOne<Head> | RecordKeys<Tail>
  : never;

type RecordKeysOne<H> = H extends [infer K, infer _IB] ? (K extends string ? K : never) : never;

export type GetPartial<B> = B extends RecordBlockBuilder<any, any, infer S>
  ? RecordPartial<S>
  : never;

export type GetValid<B> = B extends RecordBlockBuilder<any, any, infer S> ? RecordValid<S> : never;
