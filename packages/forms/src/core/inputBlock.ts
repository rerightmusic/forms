import { Either } from 'fp-ts/lib/Either';
import { DateInputBlock } from './dateInputBlock';
import { DurationInputBlock } from './durationInputBlock';
import { ListInputBlock } from './listInputBlock';
import { MultiSelectInputBlock } from './multiSelectInputBlock';
import { NumberInputBlock } from './numberInputBlock';
import { RecordInputBlock, SectionInputBlock } from './record/recordInputBlock';
import { SearchInputBlock } from './searchInputBlock';
import { SelectInputBlock } from './selectInputBlock';
import { TagsInputBlock } from './tagsInputBlock';
import { TextInputBlock } from './textInputBlock';
import { ToggleInputBlock } from './toggleInputBlock';
import { Invalid } from './validator';
import { ValueInputBlock } from './valueInputBlock';

export type InputBlockTypes<Req extends boolean, PS, P, V> = {
  required: Req;
  partial: P;
  partialState: PS;
  valid: V;
};

export type InputState<PS, V> = {
  tag: 'InputState';
  partialState: PS;
  edited: boolean;
  valid: Either<Invalid, V>;
  ignore?: boolean;
  visible?: boolean;
};
export class NestedInputBlock<R, _Req extends boolean, PS, P, V, B> {
  constructor(
    readonly apply: {
      block: (props: RenderProps<R, PS, V>) => B;
      calculateState: (props: CalculateProps<R, PS, P, V>) => InputState<PS, V>;
    }
  ) {}

  mapSeed<P_>(f: (p: P_) => P) {
    return new NestedInputBlock<R, _Req, PS, P_, V, B>({
      block: props => this.apply.block(props),
      calculateState: props =>
        this.apply.calculateState({
          req: props.req,
          state: props.state,
          seed: props.seed ? f(props.seed) : null,
        }),
    });
  }
}

export type CalculateProps<R, PS, P, V> = {
  req: R;
  seed: P | null;
  state: StateProps<PS, V> | null;
};

export type RenderProps<R, PS, V> = {
  req: R;
  get: InputState<PS, V>;
  set: (s: InputState<PS, V>) => void;
};

export type StateProps<PS, V> = {
  get: InputState<PS, V>;
  set: (s: InputState<PS, V>) => void;
};

export type InputBlock =
  | ListInputBlock<any, any>
  | TextInputBlock
  | RecordInputBlock
  | NumberInputBlock
  | TagsInputBlock
  | SearchInputBlock<any>
  | SelectInputBlock
  | MultiSelectInputBlock
  | DurationInputBlock
  | DateInputBlock
  | SectionInputBlock
  | ValueInputBlock<any>
  | ToggleInputBlock<any, any>;
