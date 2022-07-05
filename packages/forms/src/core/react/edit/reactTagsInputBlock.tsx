import { addSpacing } from '../layout';
import { TagsInputBlock } from '../../tagsInputBlock';
import Tags from './tags';

export const reactTagsInputBlock = (b: TagsInputBlock, idx: number) => {
  return addSpacing(
    idx,
    <Tags
      error={b.error}
      value={b.value || undefined}
      onSearch={b.onSearch}
      label={b.label}
      width={b.width}
      required={b.required}
      onChange={b.onChange}
      selectFrom={b.selectFrom}
    />
  );
};
