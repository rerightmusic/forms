import {
  Box,
  Button,
  Chip,
  FormControl,
  FormGroup,
  FormHelperText,
  FormLabel,
  InputLabel,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { SelectInputBlock } from '../../selectInputBlock';
import { addSpacing, withBreak } from '../layout';

export const reactSelectInputBlock = (b: SelectInputBlock, idx: number) => {
  if (b.chips === true) {
    const el = (
      <FormControl sx={{ mt: '-8px' }} fullWidth>
        <FormLabel sx={{ mb: '10px', ml: '5px', fontSize: '15px' }} required={b.required}>
          {b.label}
        </FormLabel>
        <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', m: '-5px' }}>
          {b.options.map((o, idx) => (
            <Chip
              key={o.value}
              color={o.value === b.value ? 'primary' : 'default'}
              sx={{ width: '120px', height: '35px', m: '5px' }}
              onClick={() => (o.value === b.value ? b.onChange(null) : b.onChange(o.value))}
              label={o.name}
            />
          ))}
        </FormGroup>
        {b.error ? (
          <FormHelperText sx={{ m: 0 }} error={true}>
            {b.error}
          </FormHelperText>
        ) : null}
      </FormControl>
    );
    return b.inline === true ? addSpacing(idx, el) : withBreak(idx, el);
  } else {
    return addSpacing(
      idx,
      <FormControl fullWidth>
        <InputLabel required={b.required}>{b.label}</InputLabel>
        <Select
          sx={theme => ({
            width: b.short === true ? '120px' : '320px',
            [theme.breakpoints.only('xs')]: { width: '100%' },
          })}
          readOnly={b.readonly}
          required={b.required}
          error={!!b.error}
          value={b.value || ''}
          label={b.label}
          onChange={v => b.onChange(v.target.value !== '' ? v.target.value : null)}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: '300px',
                '::-webkit-scrollbar': {
                  WebkitAppearance: 'none',
                  width: '7px',
                },
                '::-webkit-scrollbar-thumb': {
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0,0,0,.5)',
                },
              },
            },
          }}
        >
          {!b.required && (
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
          )}
          {b.options.map(o => (
            <MenuItem key={o.value} value={o.value}>
              {o.name}
            </MenuItem>
          ))}
        </Select>
        {b.error ? <FormHelperText error={true}>{b.error}</FormHelperText> : null}
      </FormControl>
    );
  }
};
