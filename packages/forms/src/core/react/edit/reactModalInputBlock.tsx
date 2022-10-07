import { Box, Paper, TextField, Theme, Typography } from '@mui/material';
import React, { FunctionComponent } from 'react';
import Modal from '../../../layout/modal';
import { ModalInputBlock } from '../../modalInputBlock';
import { RecordState } from '../../record/recordBlockTypes';
import { addSpacing, withBreak } from '../layout';
import { recordBlock } from './reactEditRecordInputBlock';

export const reactModalInputBlock = (b: ModalInputBlock<any, any>, idx: number, theme: Theme) => {
  const LModalComponent: FunctionComponent<ModalComponentProps<RecordState<any, any>>> =
    ModalComponent;
  const f = b.mode?.type === 'inline' ? addSpacing : withBreak;
  return f(
    idx,
    <LModalComponent
      label={b.label}
      buildEmptyValue={b.buildEmptyValue}
      editLabel={b.editLabel || 'Edit data'}
      primaryButton={b.primaryButton}
      secondaryButton={b.secondaryButton}
      modalLabelLines={b.modalLabelLines}
      mode={b.mode}
      template={(data, onChange_) => {
        return recordBlock(b.template(data, onChange_), theme);
      }}
      value={b.value || undefined}
      onChange={b.onChange}
    />
  );
};

export type ModalComponentProps<T> = {
  id?: string;
  editLabel: string;
  modalLabelLines?: string[];
  primaryButton?: { label?: string; onClick?: () => void };
  secondaryButton?: { label?: string; onClick?: () => void };
  mode?:
    | {
        type: 'inline';
        resultLabel?: string;
      }
    | {
        type: 'multiline';
        resultLabelLines?: string[];
      };
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
  primaryButton,
  secondaryButton,
  modalLabelLines,
  editLabel,
  mode = { type: 'multiline' },
  template,
  value,
  onChange,
  buildEmptyValue,
}: ModalComponentProps<T>) => {
  const itemForm = template(value || buildEmptyValue(), onChange);
  const modal = (
    <Modal
      openLabel={editLabel}
      primaryButton={
        primaryButton
          ? primaryButton
          : {
              label: 'Done',
            }
      }
      secondaryButton={secondaryButton}
      sx={{ minWidth: '70%' }}
      title={
        modalLabelLines &&
        modalLabelLines.length > 0 && (
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
      <Box sx={{ p: '20px 0px' }}>{itemForm}</Box>
    </Modal>
  );
  return (
    <Box id={id}>
      {mode && mode.type === 'multiline' && (
        <>
          <Typography sx={{ fontSize: '15px', color: 'gray' }}>{label}</Typography>
          {mode.resultLabelLines && mode.resultLabelLines.length > 0 && (
            <Paper variant="outlined" sx={{ p: '15px', mt: '8px' }}>
              <Typography>
                {mode.resultLabelLines.flatMap((l, idx) => (
                  <span key={idx}>
                    {idx !== 0 && <br />}
                    {l}
                  </span>
                ))}
              </Typography>
            </Paper>
          )}
          <Box sx={{ mt: '8px' }}>{modal}</Box>
        </>
      )}
      {mode && mode.type === 'inline' && (
        <TextField
          label={label}
          value={mode.resultLabel || ''}
          sx={theme => ({
            '.MuiOutlinedInput-root': {
              pr: '12px',
            },
            '.MuiOutlinedInput-input': {
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              flex: 1,
            },
            width: '320px',
            [theme.breakpoints.only('xs')]: { width: '100%' },
          })}
          InputProps={{
            readOnly: true,
            endAdornment: modal,
          }}
        />
      )}
    </Box>
  );
};
