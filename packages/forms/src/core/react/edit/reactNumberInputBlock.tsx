import { TextField, Typography } from '@mui/material';
import { NumberInputBlock } from '../../numberInputBlock';
import { addSpacing } from '../layout';

export const reactNumberInputBlock = (b: NumberInputBlock, idx: number) => {
  return addSpacing(
    idx,
    <TextField
      type="tel"
      error={!!b.error}
      helperText={b.error}
      required={b.required}
      onChange={ev => b.onChange(ev.target.value)}
      label={b.label}
      sx={theme => ({
        width: '320px',
        '&.MuiTextField-root': { m: 0 },
        [theme.breakpoints.only('xs')]: { width: '100%' },
      })}
      value={b.value || ''}
      InputProps={
        b.suffix
          ? {
              endAdornment: (
                <Typography sx={{ color: '#505050', display: 'inline', fontSize: '15px' }}>
                  {b.suffix}
                </Typography>
              ),
            }
          : {}
      }
    />
  );
};
