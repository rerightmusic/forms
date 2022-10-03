import { Box, Button, Divider, IconButton, Modal, Paper, Typography } from '@mui/material';
import { useTheme, Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import React, { useState } from 'react';
import { mergeSx } from '../../mui';

export const ModalView = ({
  title,
  children,
  openIcon,
  openLabel,
  sx,
  onCancel,
  onDone,
  doneButton,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  openIcon?: JSX.Element;
  openLabel?: string;
  doneButton?: boolean;
  onDone?: () => void;
  onCancel?: () => void;
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <Box>
      {openIcon && <IconButton onClick={() => setOpen(true)}>{openIcon}</IconButton>}
      {openLabel && (
        <Button sx={{ ml: '-8px' }} onClick={() => setOpen(true)}>
          {openLabel}
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={mergeSx(
            {
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxHeight: '90%',
              maxWidth: '90%',
              margin: '0 auto',
              bgcolor: 'background.paper',
              borderRadius: '10px',
              border: `2px solid white`,
              boxShadow: 24,
              [theme.breakpoints.only('xs')]: {
                width: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                boxSizing: 'border-box',
              },
            },
            sx
          )}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '100%',
              overflowY: 'auto',
              m: '-2px',
              borderRadius: '10px',
            }}
          >
            {title && (
              <Box
                sx={theme => ({
                  background: theme.palette.primary.main,
                  color: 'white',
                  p: '20px',
                })}
              >
                {title}
              </Box>
            )}
            <Box
              sx={{
                background: 'white',
                position: 'relative',
                overflowY: 'auto',
                flex: '1',
                p: '20px',
              }}
            >
              {children}
            </Box>
            <Divider />
            <Box
              sx={{
                p: '40px 20px',
                boxSizing: 'border-box',
                width: '100%',
                height: '57px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'end',
              }}
            >
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
