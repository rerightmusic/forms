import { withBreak } from '../layout';
import { TypedTagsInputBlock } from '../../typedTagsInputBlock';
import TypedTags from './typedTags';

export const reactTypedTagsInputBlock = <T extends string>(
  b: TypedTagsInputBlock<T>,
  idx: number
) => {
  return withBreak(
    idx,
    <TypedTags
      types={b.types}
      error={b.error}
      value={b.value || undefined}
      onSearch={b.onSearch}
      label={b.label}
      width={b.width}
      allowNewTags={b.allowNewTags}
      required={b.required}
      onChange={b.onChange}
    />
  );
};
