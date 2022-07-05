import AdapterDateFns from '@mui/lab/AdapterDateFns';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { FormHelperText, TextField } from '@mui/material';
import { DateInputBlock } from '../../dateInputBlock';
import { addSpacing } from '../layout';

export const reactDateInputBlock = (b: DateInputBlock, idx: number) => {
  return addSpacing(
    idx,
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDatePicker
          mask={b.yearOnly === true ? '____' : '__-__-____'}
          label={b.required === true ? `${b.label}*` : b.label}
          inputFormat={b.yearOnly === true ? 'yyyy' : 'MM-dd-yyyy'}
          onChange={ev => b.onChange(ev)}
          value={b.value}
          views={b.yearOnly === true ? ['year'] : undefined}
          maxDate={b.maxDate}
          renderInput={params => (
            <TextField
              {...params}
              sx={theme => ({
                width: '320px',
                [theme.breakpoints.only('xs')]: { width: '100%' },
                '&.MuiTextField-root': { m: 0 },
              })}
            />
          )}
        />
      </LocalizationProvider>
      {b.error ? <FormHelperText error={true}>{b.error}</FormHelperText> : null}
    </>
  );
};
