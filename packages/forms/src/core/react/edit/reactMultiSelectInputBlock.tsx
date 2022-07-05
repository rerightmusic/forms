import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  InputLabel,
  Theme,
  Typography,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { MultiSelectInputBlock } from '../../multiSelectInputBlock';
import { addSpacing, withBreak } from '../layout';

export const reactMultiSelectInputBlock = (b: MultiSelectInputBlock, idx: number, theme: Theme) => {
  return b.dropdown === true
    ? addSpacing(
        idx,
        <FormControl
          fullWidth
          sx={theme => ({
            width: '320px',
            [theme.breakpoints.only('xs')]: { width: '100%' },
          })}
        >
          <InputLabel required={b.required}>{b.label}</InputLabel>
          <Select
            sx={theme => ({
              [theme.breakpoints.only('xs')]: {
                '& .MuiOutlinedInput-input': { whiteSpace: 'normal' },
              },
            })}
            label={b.label}
            variant="outlined"
            multiple
            value={b.value || []}
            onChange={v =>
              b.onChange(typeof v.target.value === 'string' ? [v.target.value] : v.target.value)
            }
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: '300px',
                },
              },
            }}
          >
            {b.options.map(o => (
              <MenuItem
                key={o.value}
                value={o.value}
                sx={{
                  fontWeight:
                    b.options.find(o_ => o_.value === o.value) === undefined
                      ? theme.typography.fontWeightRegular
                      : theme.typography.fontWeightMedium,
                }}
              >
                {o.name}
              </MenuItem>
            ))}
          </Select>
          {b.error ? (
            <FormHelperText sx={{ m: 0, mt: '5px' }} error={true}>
              {b.error}
            </FormHelperText>
          ) : null}
        </FormControl>
      )
    : withBreak(
        idx,
        <FormControl
          fullWidth
          sx={theme => ({
            width: '320px',
            [theme.breakpoints.only('xs')]: { width: '100%' },
          })}
        >
          <FormLabel sx={{ mb: '5px' }} required={b.required}>
            {b.label}
          </FormLabel>
          <FormGroup>
            {b.options.map(o => (
              <FormControlLabel
                key={o.value}
                control={
                  <Checkbox
                    checked={b.value?.includes(o.value) || false}
                    onChange={c =>
                      c.target.checked
                        ? b.onChange((b.value || []).concat(o.value))
                        : b.onChange((b.value || []).filter(x => x !== o.value))
                    }
                  />
                }
                label={o.name}
              />
            ))}
          </FormGroup>
          {b.error ? (
            <FormHelperText sx={{ m: 0 }} error={true}>
              {b.error}
            </FormHelperText>
          ) : null}
        </FormControl>,
        { mb: '0px', mt: '5px' }
      );
};
