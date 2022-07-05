import { Theme, Typography, useTheme } from '@mui/material';
import { SxProps } from '@mui/system';
import React from 'react';
import { CenterPage } from '../layout/center';

export const Error = ({ message, sx }: { message: string; sx?: SxProps<Theme> }) => {
  const theme = useTheme();
  return (
    <Typography
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
      variant="h6"
      color={theme.palette.error.main}
    >
      {message}
    </Typography>
  );
};

export const PageError = ({ message, sx }: { message: string; sx?: SxProps<Theme> }) => {
  return (
    <CenterPage>
      <Error message={message} sx={sx} />
    </CenterPage>
  );
};

export const TextError = ({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) => {
  const theme = useTheme();
  return (
    <Typography sx={{ ...sx, fontSize: '14px' }} color={theme.palette.error.main}>
      {children}
    </Typography>
  );
};
