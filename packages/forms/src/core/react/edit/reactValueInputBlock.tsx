import { TextField } from '@mui/material';
import { ValueInputBlock } from '../../valueInputBlock';
import { addSpacing } from '../layout';

export const reactValueInputBlock = (b: ValueInputBlock<any>, idx: number) => {
  return addSpacing(
    idx,
    <TextField
      error={!!b.error}
      helperText={b.error}
      required={b.required}
      label={b.label}
      sx={theme => ({
        width: '320px',
        [theme.breakpoints.only('xs')]: { width: '100%' },
        '&.MuiTextField-root': { m: 0 },
      })}
      value={b.value || ''}
      InputProps={{
        readOnly: true,
      }}
    />
  );
};
