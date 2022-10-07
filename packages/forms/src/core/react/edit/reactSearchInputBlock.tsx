import SearchInput from '../../../input/searchInput';
import { SearchInputBlock } from '../../searchInputBlock';
import { addSpacing } from '../layout';

export const reactSearchInputBlock = (b: SearchInputBlock<any>, idx: number) => {
  return addSpacing(
    idx,
    <SearchInput
      error={b.error}
      value={b.value || undefined}
      readonly={b.readonly}
      disabled={b.disabled}
      onSearch={b.onSearch}
      label={b.label}
      selectedSubtitleVisible={b.selectedSubtitleVisible}
      required={b.required}
      createNew={b.createNew}
      createFromText={b.createFromText}
      onChange={b.onChange}
      onSelectedClick={b.onSelectedClick}
      onSelectedHref={b.onSelectedHref}
      isEqual={(v1, v2) => v1 === v2}
    />
  );
};
