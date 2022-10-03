import { Box, Paper, Theme, Typography } from '@mui/material';
import React, { FunctionComponent } from 'react';
import { ModalInputBlock } from '../../modalInputBlock';
import { RecordState } from '../../record/recordBlockTypes';
import { withBreak } from '../layout';
import ModalView from '../modalView';
import { recordBlock } from './reactEditRecordInputBlock';

export const reactModalInputBlock = (b: ModalInputBlock<any, any>, idx: number, theme: Theme) => {
  const LModalComponent: FunctionComponent<ModalComponentProps<RecordState<any, any>>> =
    ModalComponent;
  return withBreak(
    idx,
    <LModalComponent
      label={b.label}
      buildEmptyValue={b.buildEmptyValue}
      editLabel={b.editLabel || 'Edit data'}
      modalLabelLines={b.modalLabelLines}
      resultLabelLines={b.resultLabelLines}
      template={(data, onChange_) => {
        return recordBlock(b.template(data, onChange_), theme);
      }}
      value={b.value || undefined}
      onChange={b.onChange}
    />,
    { my: '8px' }
  );
};

export type ModalComponentProps<T> = {
  id?: string;
  editLabel: string;
  modalLabelLines?: string[];
  resultLabelLines?: string[];
  label: string;
  value?: T;
  required?: boolean;
  buildEmptyValue: () => T;
  template: (data: T, onChange: (data: T) => void) => React.ReactNode;
  onChange: (data: T) => void;
};

const ModalComponent = <T,>({
  id,
  label,
  modalLabelLines,
  editLabel,
  resultLabelLines,
  template,
  value,
  onChange,
  buildEmptyValue,
}: ModalComponentProps<T>) => {
  const itemForm = template(value || buildEmptyValue(), onChange);

  return (
    <Box id={id}>
      <Typography sx={{ fontSize: '16px', color: 'gray' }}>{label}</Typography>
      {resultLabelLines && (
        <Paper variant="outlined" sx={{ p: '15px', mt: '10px', mb: '3px' }}>
          <Typography>
            {resultLabelLines.flatMap((l, idx) => (
              <span key={idx}>
                {idx !== 0 && <br />}
                {l}
              </span>
            ))}
          </Typography>
        </Paper>
      )}
      <ModalView
        openLabel={editLabel}
        doneButton
        sx={{ minWidth: '70%' }}
        title={
          modalLabelLines && (
            <Typography>
              {modalLabelLines.map((l, idx) => (
                <span key={idx}>
                  {idx !== 0 && <br />}
                  {l}
                </span>
              ))}
            </Typography>
          )
        }
      >
        {itemForm}
      </ModalView>
    </Box>
  );
};
