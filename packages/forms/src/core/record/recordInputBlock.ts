import { Block } from '../block';
import { NestedInputBlock } from '../inputBlock';
import { create, RecordBlockBuilder } from './recordBlockBuilder';
import { RecordPartial, RecordPartialState } from './recordBlockTypes';

export type RecordNestedInputBlock<R, S extends any[], V> = NestedInputBlock<
  R,
  true,
  RecordPartialState<S>,
  RecordPartial<S>,
  V,
  RecordInputBlock,
  { showErrors: boolean },
  'object',
  S
>;

export function record<R extends object, R_ extends object, S extends any[], V>(
  b: (r: RecordBlockBuilder<R, {}, []>) => RecordNestedInputBlock<R & R_, S, V>
): RecordNestedInputBlock<R & R_, S, V> {
  return b(create<R>());
}

export type RecordInputBlock = {
  tag: 'RecordInputBlock';
  blocks: Block[];
  visible?: boolean;
  label?: string;
};

export type SectionInputBlock = {
  tag: 'SectionInputBlock';
  title?: string;
  block: RecordInputBlock;
  divider?: boolean;
};
