import { Box, Theme } from '@mui/material';
import { SxProps, SystemStyleObject } from '@mui/system';
import { mergeSx } from '../../mui';

export const addSpacing = (idx: number | string, el: React.ReactNode, sx?: SxProps<Theme>) => [
  <Box
    key={idx}
    sx={mergeSx(
      theme => ({
        m: '15px',
        [theme.breakpoints.only('xs')]: { width: '100%' },
      }),
      sx
    )}
  >
    {el}
  </Box>,
];

export const withBreak = (idx: number | string, el: React.ReactNode, sx?: SxProps<Theme>) => [
  <Box key={`${idx}_break_before`} sx={{ flexBasis: '100%', height: 0, mx: '15px' }} />,
  <Box
    key={idx}
    sx={mergeSx(
      theme => ({
        m: '15px',
        [theme.breakpoints.only('xs')]: { width: '100%' },
      }),
      sx
    )}
  >
    {el}
  </Box>,
  <Box key={`${idx}_break_after`} sx={{ flexBasis: '100%', height: 0, mx: '15px' }} />,
];
