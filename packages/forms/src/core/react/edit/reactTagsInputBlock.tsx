import { TagsInputBlock } from '../../tagsInputBlock';
import { withBreak } from '../layout';
import Tags from './tags';

export const reactTagsInputBlock = (b: TagsInputBlock, idx: number) => {
  return withBreak(
    idx,
    <Tags
      error={b.error}
      value={b.value || undefined}
      onSearch={b.onSearch}
      label={b.label}
      required={b.required}
      onChange={b.onChange}
      selectFrom={b.selectFrom}
    />
  );
};
