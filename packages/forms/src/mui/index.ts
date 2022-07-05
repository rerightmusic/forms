import { Theme } from '@mui/material';
import { SystemStyleObject, SxProps } from '@mui/system';
import _ from 'lodash';

export const mergeSx = (...sxs: (SxProps<Theme> | undefined)[]) => {
  return _.reduce(
    sxs,
    (p, n) => {
      if (n && typeof n === 'function') {
        return theme => ({ ...p(theme), ...(n(theme) as SystemStyleObject<Theme>) });
      } else if (n) return theme => ({ ...p(theme), ...n } as SystemStyleObject<Theme>);
      return p;
    },
    (_: Theme) => ({} as SystemStyleObject<Theme>)
  ) as SxProps<Theme>;
};
