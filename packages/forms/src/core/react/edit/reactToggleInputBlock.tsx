import { Box, Button, Theme, Typography } from '@mui/material';
import React, { FunctionComponent } from 'react';
import { RecordState } from '../../record/recordBlockTypes';
import { ToggleInputBlock } from '../../toggleInputBlock';
import { withBreak } from '../layout';
import { recordBlock } from './reactEditRecordInputBlock';

export const reactToggleInputBlock = (b: ToggleInputBlock<any, any>, idx: number, theme: Theme) => {
  const LToggleComponent: FunctionComponent<ToggleComponentProps<RecordState<any, any>>> =
    ToggleComponent;
  return withBreak(
    idx,
    <LToggleComponent
      label={b.label}
      buildEmptyValue={b.buildEmptyValue}
      addLabel={b.addLabel || 'Add data'}
      removeLabel={b.removeLabel || 'Remove data'}
      template={(data, onChange_) => {
        return recordBlock(b.template(data, onChange_), theme);
      }}
      value={b.value || undefined}
      onChange={b.onChange}
    />,
    { my: '8px' }
  );
};

export type ToggleComponentProps<T> = {
  id?: string;
  addLabel: string;
  label: string;
  removeLabel: string;
  value?: T | null;
  required?: boolean;
  buildEmptyValue: () => T;
  template: (data: T, onChange: (data: T) => void) => React.ReactNode;
  onChange: (data: T | null) => void;
};

const ToggleComponent = <T,>({
  id,
  label,
  addLabel,
  removeLabel,
  template,
  value = null,
  onChange,
  buildEmptyValue,
}: ToggleComponentProps<T>) => {
  const itemForm = value ? template(value, onChange) : null;

  return (
    <Box id={id}>
      <Typography sx={{ fontSize: '16px', color: 'gray' }}>{label}</Typography>
      {<Box sx={{ my: itemForm ? '15px' : '5px' }}>{itemForm}</Box>}
      {itemForm === null ? (
        <Button onClick={() => onChange(buildEmptyValue())} sx={{ ml: '-8px', mt: '-5px' }}>
          {addLabel}
        </Button>
      ) : (
        <Button onClick={() => onChange(null)} sx={{ ml: '-8px', mt: '-5px' }}>
          {removeLabel}
        </Button>
      )}
    </Box>
  );
};
