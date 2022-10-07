import { Switch, FormLabel, SxProps, Theme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import { mergeSx } from '../../../mui';
import { BooleanInputBlock } from '../../booleanInputBlock';
import { addSpacing } from '../layout';

export const reactBooleanInputBlock = (b: BooleanInputBlock, idx: number, sx?: SxProps<Theme>) => {
  return addSpacing(
    idx,
    <FormControl sx={mergeSx(sx, { height: '56px' })} required={b.required} error={!!b.error}>
      <FormLabel sx={{ fontSize: '15px', '&.Mui-focused': { color: 'rgba(0, 0, 0, 0.6)' } }}>
        {b.label}
      </FormLabel>

      {/* <FormControlLabel
          label=""
          control={ */}
      <Switch
        sx={{ ml: '-8px' }}
        checked={b.value === null ? false : b.value}
        onChange={v => b.onChange(v.target.checked)}
      />
      {/* }
        /> */}

      {b.error && <FormHelperText>{b.error}</FormHelperText>}
    </FormControl>
  );
};
