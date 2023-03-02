import { Either } from 'fp-ts/lib/Either';
import { BooleanInputBlock } from './booleanInputBlock';
import { DateInputBlock } from './dateInputBlock';
import { DurationInputBlock } from './durationInputBlock';
import { ListInputBlock } from './listInputBlock';
import { ModalInputBlock } from './modalInputBlock';
import { MultiSelectInputBlock } from './multiSelectInputBlock';
import { NumberInputBlock } from './numberInputBlock';
import {
  RecordPartial,
  RecordPartialState,
  RecordState,
  RecordValid,
} from './record/recordBlockTypes';
import { RecordInputBlock } from './record/recordInputBlock';
import { SearchInputBlock } from './searchInputBlock';
import { SectionInputBlock } from './sectionInputBlock';
import { SelectInputBlock } from './selectInputBlock';
import { TagsInputBlock } from './tagsInputBlock';
import { TextInputBlock } from './textInputBlock';
import { ToggleInputBlock } from './toggleInputBlock';
import { TypedTagsInputBlock } from './typedTagsInputBlock';
import { Invalid } from './validator';
import { ValueInputBlock } from './valueInputBlock';

export type ReducePS<Type, PS> = Type extends 'array' ? null : Type extends 'object' ? null : PS;
export type ReduceP<Type, P> = Type extends 'array' ? null : Type extends 'object' ? null : P;
export type GetPS<Type, PS, Shape> = Type extends 'array'
  ? RecordState<Shape, RecordValid<Shape>>[] | null
  : Type extends 'object'
  ? RecordPartialState<Shape>
  : PS;

export type GetP<Type, P, Shape> = Type extends 'array'
  ? RecordPartial<Shape>[]
  : Type extends 'object'
  ? RecordPartial<Shape>
  : P;

export type InputState<PS, V, Other> = {
  tag: 'InputState';
  partialState: PS;
  edited: boolean;
  valid: Either<Invalid, V>;
  ignore?: boolean;
  visible?: boolean;
} & Other;

// TODO make the Type Shape thing nicer. Currently allows storing the Shape for Arrays and Object to avoid pushing
// resolved records or arrays of records to the Type at typechecking time
/**
 * General Block type that all input blocks are created from
 */
export class NestedInputBlock<
  R,
  _Req extends boolean,
  PS,
  P,
  V,
  B,
  Other,
  Type = null,
  Shape = null
> {
  constructor(
    readonly apply: {
      block: (props: RenderProps<R, PS, V, Other>) => B;
      calculateState: (props: CalculateProps<R, PS, P, V, Other>) => InputState<PS, V, Other>;
    },
    readonly keys: string[] = []
  ) {}

  // TODO this is problematic when used with the onChange prop. onChange returns the partial object
  // as generated from traversing the object and extracting the leaf PartialState types.
  // If this value is then passed as the seed to the form the PartialState type for the type that was
  // mapped using this function won't match
  /**
   * Map seed type to another type such that the input can be populated from a different type
   * than its default seed/partial type.
   */
  mapSeed<P_>(f: (p: P_) => P) {
    return new NestedInputBlock<R, _Req, PS, P_, V, B, Other>(
      {
        block: props => this.apply.block(props),
        calculateState: props =>
          this.apply.calculateState({
            req: props.req,
            state: props.state,
            seed: props.seed !== null ? f(props.seed) : null,
          }),
      },
      this.keys
    );
  }
}

export type CalculateProps<R, PS, P, V, Other> = {
  req: R;
  seed: P | null;
  state: StateProps<PS, V, Other> | null;
};

export type RenderProps<R, PS, V, Other> = {
  req: R;
  get: InputState<PS, V, Other>;
  set: (s: InputState<PS, V, Other>) => void;
  showErrors: boolean;
};

export type StateProps<PS, V, Other> = {
  get: InputState<PS, V, Other>;
  set: (s: InputState<PS, V, Other>) => void;
};

export type InputBlock =
  | ListInputBlock<any, any>
  | TextInputBlock
  | BooleanInputBlock
  | RecordInputBlock
  | NumberInputBlock
  | TagsInputBlock
  | TypedTagsInputBlock<any>
  | SearchInputBlock<any>
  | SelectInputBlock
  | MultiSelectInputBlock
  | DurationInputBlock
  | DateInputBlock
  | SectionInputBlock
  | ValueInputBlock<any>
  | ToggleInputBlock<any, any>
  | ModalInputBlock<any, any>;
