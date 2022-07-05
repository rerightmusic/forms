import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import { Box, Button, FormHelperText, IconButton, Modal as MModal } from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { Either } from 'fp-ts/lib/Either';
import React, { useState, useMemo } from 'react';
import { ReactEditRecordInputBlock } from '../core';
import { RecordBlockBuilder } from '../core/record/recordBlockBuilder';
import { RecordValid } from '../core/record/recordBlockTypes';

export const Modal = ({
  open,
  sx,
  onClose,
  confirmButton,
  color,
  children,
  cancelButton,
}: {
  open: boolean;
  sx?: SxProps<Theme>;
  color?: 'primary' | 'danger';
  onClose?: () => void;
  children: React.ReactNode;
  cancelButton?: boolean;
  confirmButton?: {
    label: string;
    onConfirm: () => Promise<Either<React.ReactNode, any>>;
  };
}) => {
  const theme = useTheme();
  const [state, setState] = useState({
    loading: false,
    error: null as React.ReactNode | null,
    open,
  });
  const closeModal = () => {
    setState(s => ({ ...s, open: false, loading: false, error: null }));
    onClose && onClose();
  };
  return (
    <MModal open={state.open} onClose={closeModal}>
      <Box
        sx={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: '0 auto',
          [theme.breakpoints.only('xs')]: {
            width: '100%',
            minWidth: 0,
          },
          minWidth: '500px',
          minHeight: '100px',
          bgcolor: 'background.paper',
          borderRadius: '10px',
          border: `4px solid ${
            color === 'danger' ? theme.palette.error.main : theme.palette.primary.main
          }`,
          boxShadow: 24,
          p: '20px',
          ...sx,
        }}
      >
        <IconButton sx={{ position: 'absolute', right: 0, top: 0 }} onClick={closeModal}>
          <CloseIcon />
        </IconButton>
        {children}
        <Box sx={{ display: 'flex' }}>
          {cancelButton === true && (
            <Button sx={{ color: 'black', mr: '20px' }} onClick={closeModal}>
              Cancel
            </Button>
          )}
          {confirmButton && (
            <LoadingButton
              loading={state.loading}
              onClick={() => {
                setState(s => ({ ...s, loading: true }));
                confirmButton.onConfirm().then(r => {
                  if (r._tag === 'Right') {
                    setState(s => ({ ...s, error: null, loading: false }));
                  } else {
                    setState(s => ({ ...s, error: r.left, loading: false }));
                  }
                });
              }}
              color={color === 'danger' ? 'error' : 'primary'}
              variant="contained"
              sx={{ width: '100px' }}
            >
              {confirmButton.label}
            </LoadingButton>
          )}
        </Box>
        <FormHelperText sx={{ mt: '10px', maxWidth: '350px' }} error={true}>
          {state.error}
        </FormHelperText>
      </Box>
    </MModal>
  );
};

export default Modal;
