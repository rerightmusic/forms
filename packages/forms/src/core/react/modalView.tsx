import { Box, Button, IconButton, Modal } from '@mui/material';
import { useTheme, Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import React, { useState } from 'react';
import { mergeSx } from '../../mui';

export const ModalView = ({
  children,
  icon,
  sx,
  onCancel,
  onDone,
  doneButton,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  icon: JSX.Element;
  doneButton?: boolean;
  onDone?: () => void;
  onCancel?: () => void;
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <IconButton onClick={() => setOpen(true)}>{icon}</IconButton>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={mergeSx(
            {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxHeight: '70%',
              margin: '0 auto',
              width: '500px',
              bgcolor: 'background.paper',
              borderRadius: '10px',
              border: `4px solid ${theme.palette.primary.main}`,
              boxShadow: 24,
              p: '20px',
              pb: '57px',
              [theme.breakpoints.only('xs')]: {
                width: '100%',
                boxSizing: 'border-box',
              },
            },
            sx
          )}
        >
          <Box sx={{ position: 'relative' }}>
            <Box>{children}</Box>
            <Box sx={{ position: 'fixed', bottom: '10px', right: '20px' }}>
              {onCancel && (
                <Button
                  sx={{ mr: '20px' }}
                  onClick={() => {
                    onCancel && onCancel();
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
              )}
              {(onDone || doneButton === true) && (
                <Button
                  onClick={() => {
                    onDone && onDone();
                    setOpen(false);
                  }}
                  variant="contained"
                >
                  Done
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ModalView;
