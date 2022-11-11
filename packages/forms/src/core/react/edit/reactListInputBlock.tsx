import { Theme } from '@mui/material';
import { FunctionComponent } from 'react';
import ListComponent, { ListComponentProps } from '../../../input/listComponent';
import { ListInputBlock } from '../../listInputBlock';
import { RecordState } from '../../record/recordBlockTypes';
import { withBreak } from '../layout';
import { recordBlock } from './reactEditRecordInputBlock';

export const reactListInputBlock = (b: ListInputBlock<any, any>, idx: number, theme: Theme) => {
  const LListComponent: FunctionComponent<ListComponentProps<RecordState<any, any>>> =
    ListComponent;
  return withBreak(
    idx,
    <LListComponent
      required={b.required}
      error={b.error}
      label={b.label}
      labelButton={b.labelButton}
      buildEmptyValue={b.buildEmptyValue}
      addLabel={b.itemLabel ? `Add ${b.itemLabel}` : 'Add item'}
      itemLabel={b.itemLabel}
      createEmpty={b.createEmpty}
      template={(data, onChange_) => {
        return recordBlock(b.template(data, onChange_), theme);
      }}
      value={b.value || undefined}
      onChange={b.onChange}
      outlined={b.outlined}
      noinline={b.noinline}
    />,
    { my: '8px', [theme.breakpoints.only('xs')]: { width: 'calc(100% - 30px)' } }
  );
};
