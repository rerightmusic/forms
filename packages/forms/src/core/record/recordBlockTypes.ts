import { GetP, GetPS, InputState } from '../inputBlock';
import { RecordBlockBuilder } from './recordBlockBuilder';

export type RecordState<S, V> = InputState<RecordPartialState<S>, V, { showErrors: boolean }>;

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
    ? InputState<P, V, {}>
    : S[P] extends Array<infer U>
    ? ExpectPartialState<U>[]
    : S[P] extends object
    ? ExpectPartialState<S[P]>
    : unknown;
};

export type RecordPartial<S> = S extends [infer Head, ...infer Tail]
  ? RecordPartialOne<Head> & RecordPartial<Tail>
  : {};

type RecordPartialOne<H> = H extends [infer K extends string, infer IB]
  ? IB extends [infer _Req, infer _PS, null, infer _V, infer _Other, null, infer _Shape]
    ? {}
    : IB extends [infer _Req, infer _PS, infer P, infer _V, infer _Other, infer Type, infer Shape]
    ? { [k in K]?: GetP<Type, P, Shape> }
    : never
  : never;

export type RecordPartialState<S> = S extends [infer Head, ...infer Tail]
  ? RecordPartialStateOne<Head> & RecordPartialState<Tail>
  : {};

type RecordPartialStateOne<H> = H extends [infer K extends string, infer IB]
  ? IB extends [infer _Req, infer PS, infer _P, infer V, infer Other, infer Type, infer Shape]
    ? { [k in K]: InputState<GetPS<Type, PS, Shape>, V, Other> }
    : never
  : never;

export type RecordValid<S> = S extends [infer Head, ...infer Tail]
  ? RecordValidOne<Head> & RecordValid<Tail>
  : {};

type RecordValidOne<H> = H extends [infer K extends string, infer IB]
  ? IB extends [infer Req, infer _PS, infer _P, infer V, infer _Other, infer _Type, infer _Shape]
    ? { [k in K]: Req extends true ? V : V | null }
    : never
  : never;

export type RecordValidOrNull<S> = S extends [infer Head, ...infer Tail]
  ? RecordValidOrNullOne<Head> & RecordValidOrNull<Tail>
  : {};

type RecordValidOrNullOne<H> = H extends [infer K extends string, infer IB]
  ? IB extends [infer _Req, infer _PS, infer _P, infer V, infer _Other, infer _Type, infer _Shape]
    ? { [k in K]: V | null }
    : never
  : never;

export type RecordKeys<S> = S extends [infer Head, ...infer Tail]
  ? RecordKeysOne<Head> | RecordKeys<Tail>
  : never;

type RecordKeysOne<H> = H extends [infer K, infer _IB] ? (K extends string ? K : never) : never;

export type GetPartial<B> = B extends RecordBlockBuilder<any, any, infer S>
  ? RecordPartial<S>
  : never;

export type GetRecordPartialState<B> = B extends RecordBlockBuilder<any, any, infer S>
  ? RecordPartialState<S>
  : never;

export type GetValid<B> = B extends RecordBlockBuilder<any, any, infer S> ? RecordValid<S> : never;
