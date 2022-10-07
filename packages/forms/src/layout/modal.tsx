import { LoadingButton } from '@mui/lab';
import { Box, Button, Divider, IconButton, Modal as MModal } from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { Either } from 'fp-ts/lib/Either';
import React, { useState, useEffect } from 'react';
import { mergeSx } from '../mui';

export const Modal = ({
  openButtonSx,
  openIcon,
  openLabel,
  openClose,
  title,
  children,
  sx,
  primaryButton,
  secondaryButton,
}: {
  openIcon?: JSX.Element;
  openLabel?: string;
  openClose?: { open: boolean; onChange: (open: boolean) => void };
  title?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  openButtonSx?: SxProps<Theme>;
  primaryButton?: {
    color?: 'danger' | 'primary';
    label?: string;
    disabled?: boolean;
    onClick?: () => Promise<Either<
      React.ReactNode,
      'open' | 'close' | {} | undefined
    > | void> | void;
  };
  secondaryButton?: {
    label?: string;
    disabled?: boolean;
    onClick?: (f: (b?: 'open' | 'close') => void) => void;
  };
}) => {
  const theme = useTheme();
  const [state, setState] = useState({
    primaryButtonLoading: false,
    error: null as React.ReactNode | null,
    open: openClose?.open !== undefined ? openClose.open : false,
  });

  useEffect(() => {
    if (openClose) {
      if (state.open !== openClose.open) {
        setState(s => ({ ...s, open: openClose.open }));
      }
    }
  }, [openClose]);

  useEffect(() => {
    if (openClose) {
      if (state.open !== openClose.open) {
        openClose.onChange(state.open);
      }
    }
  }, [state.open]);

  const onClose = () => {
    setState(s => ({ ...s, open: false, primaryButtonLoading: false, error: null }));
  };
  const anyButtons = primaryButton || secondaryButton;
  return (
    <>
      {openIcon && (
        <IconButton sx={openButtonSx} onClick={() => setState(s => ({ ...s, open: true }))}>
          {openIcon}
        </IconButton>
      )}
      {openLabel && (
        <Button
          disableRipple
          sx={mergeSx(
            {
              p: 0,
              mt: '1px',
              '&.MuiButton-root:hover': {
                background: 'none',
              },
            },
            openButtonSx
          )}
          onClick={() => setState(s => ({ ...s, open: true }))}
        >
          {openLabel}
        </Button>
      )}
      <MModal open={state.open} onClose={onClose}>
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
            {
              <Box
                sx={theme => ({
                  background: theme.palette.primary.main,
                  color: 'white',
                  p: '20px',
                })}
              >
                {title}
              </Box>
            }
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
            {anyButtons && (
              <>
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
                  {secondaryButton && (
                    <Button
                      sx={{ mr: '20px' }}
                      disabled={secondaryButton.disabled}
                      onClick={() => {
                        if (secondaryButton.onClick) {
                          secondaryButton.onClick(b =>
                            setState(s => ({
                              ...s,
                              open: b === undefined ? false : b === 'open' ? true : false,
                            }))
                          );
                        } else {
                          setState(s => ({ ...s, open: false }));
                        }
                      }}
                    >
                      {secondaryButton.label || 'Cancel'}
                    </Button>
                  )}
                  {primaryButton && (
                    <LoadingButton
                      disabled={primaryButton.disabled}
                      loading={state.primaryButtonLoading}
                      onClick={() => {
                        if (primaryButton.onClick) {
                          setState(s => ({ ...s, primaryButtonLoading: true }));
                          const res = primaryButton.onClick();
                          if (res instanceof Promise)
                            res.then(r => {
                              if (typeof r === 'object' && '_tag' in r) {
                                r._tag === 'Right'
                                  ? setState(s => ({
                                      ...s,
                                      error: null,
                                      primaryButtonLoading: false,
                                      open:
                                        r.right === undefined
                                          ? false
                                          : r.right === 'open'
                                          ? true
                                          : false,
                                    }))
                                  : setState(s => ({
                                      ...s,
                                      error: r.left,
                                      primaryButtonLoading: false,
                                    }));
                              } else
                                setState(s => ({ ...s, open: false, primaryButtonLoading: false }));
                            });
                          else setState(s => ({ ...s, open: false }));
                        } else {
                          setState(s => ({ ...s, open: false }));
                        }
                      }}
                      color={primaryButton.color === 'danger' ? 'error' : 'primary'}
                      variant="contained"
                      sx={{ width: '100px' }}
                    >
                      {primaryButton.label || 'Done'}
                    </LoadingButton>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </MModal>
    </>
  );
};

export default Modal;
