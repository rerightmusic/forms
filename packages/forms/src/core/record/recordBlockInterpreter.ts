import { RecordNestedInputBlock } from './recordInputBlock';

export class RecordBlockInterpreter<R extends object, E extends object, S extends any[], V> {
  constructor(readonly apply: RecordNestedInputBlock<R, S, V>) {}

  interpret<B>(f: keyof E extends never ? (b: RecordNestedInputBlock<R, S, V>) => B : never): B {
    return f(this.apply);
  }
}
