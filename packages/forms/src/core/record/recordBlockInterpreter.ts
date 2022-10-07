import { RecordNestedInputBlock } from './recordInputBlock';

export class RecordBlockInterpreter<R extends object, S extends any[], V> {
  constructor(readonly apply: RecordNestedInputBlock<R, S, V>) {}

  interpret<B>(f: (b: RecordNestedInputBlock<R, S, V>) => B): B {
    return f(this.apply);
  }
}

export const interpret = <R, S extends any[], V, B>(
  block: RecordNestedInputBlock<R, S, V>,
  f: (b: RecordNestedInputBlock<R, S, V>) => B
) => f(block);
