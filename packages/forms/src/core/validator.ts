import { Either, left, right } from 'fp-ts/lib/Either';
import { NotUndefined } from './types';

export type Invalid = {
  error: string;
  state: 'edited' | 'always' | 'never';
};

export const invalid = (error: string, state: 'edited' | 'always' | 'never') =>
  left({
    error,
    state,
  });

export const withError = <V>(
  res: Either<Invalid, V>,
  edited: boolean | undefined,
  showErrors: boolean
) => {
  if (res._tag === 'Left') {
    if (
      showErrors ||
      (res.left.state === 'edited' && edited === true) ||
      res.left.state === 'always'
    ) {
      return res.left.error;
    }
  }
  return '';
};
export class Validator<Req extends boolean, P, V> {
  constructor(
    readonly _required: Req,
    private readonly _validate: (p: P, req?: boolean) => Either<Invalid, V>,
    private readonly _missing: ((p: P) => boolean) | null = null,
    readonly _default: P | null = null
  ) {}

  validate(p: P): Either<Invalid, V> {
    return this._validate(p, this._required);
  }

  chain<V_, Req_ extends boolean>(f: (v: Validator<Req, P, V>) => Validator<Req_, P, V_>) {
    return f(this);
  }

  andThen<V_>(f: (v: V, required?: boolean) => Either<Invalid | string, V_>) {
    return this._andThen(this._required, f);
  }

  map<V_>(f: (v: V) => NotUndefined<V_>) {
    return this._andThen(this._required, v => right(f(v)));
  }

  private _andThen<Req_ extends boolean, V_>(
    required: Req_,
    f: (v: V, req?: boolean) => Either<Invalid | string, V_>
  ) {
    return new Validator<Req_, P, V_>(
      required,
      (p, req) => {
        const res = this._validate(p, req);
        if (res._tag === 'Left') {
          return res;
        }
        const res_ = f(res.right, req);
        if (res_._tag === 'Left') {
          return typeof res_.left === 'string' ? invalid(res_.left, 'always') : left(res_.left);
        }
        return res_;
      },
      this._missing,
      this._default
    );
  }

  requiredIf<Req extends boolean>(
    predicate: Req,
    missing: ((p: P) => boolean) | null = this._missing
  ): Validator<Req, P, NonNullable<V> | V> {
    if (predicate) {
      return this.required(missing) as any;
    }
    return this as any;
  }

  required(
    missing: ((p: P) => boolean) | null = this._missing
  ): Req extends true ? unknown : Validator<true, P, NonNullable<V>> {
    return new Validator<true, P, V>(
      true,
      (v, _) => {
        if (v === null || v === undefined || (missing && missing(v))) {
          return invalid('Field is required', 'edited');
        } else {
          return this._validate(v as NonNullable<P>);
        }
      },
      missing,
      this._default
    ) as any;
  }

  default(v: P): Validator<Req, P, V> {
    return new Validator(this._required, this._validate, this._missing, v);
  }
}
