import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TimePicker from '@mui/lab/TimePicker';
import { FormHelperText, TextField } from '@mui/material';
import { dateToSeconds, secondsToDate } from '../../../time';
import { DurationInputBlock } from '../../durationInputBlock';
import { addSpacing } from '../layout';

export const reactDurationInputBlock = (b: DurationInputBlock, idx: number) => {
  return addSpacing(
    idx,
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <TimePicker
          ampm={false}
          views={['hours', 'minutes', 'seconds']}
          inputFormat="HH:mm:ss"
          mask="__:__:__"
          label={b.label}
          value={b.value ? secondsToDate(b.value) : null}
          onChange={value => {
            b.onChange(value ? dateToSeconds(value) : null);
          }}
          renderInput={params => (
            <TextField {...params} InputProps={{ ...params.InputProps, endAdornment: null }} />
          )}
        />
      </LocalizationProvider>
      {b.error ? <FormHelperText error={true}>{b.error}</FormHelperText> : null}
    </>
  );
};
