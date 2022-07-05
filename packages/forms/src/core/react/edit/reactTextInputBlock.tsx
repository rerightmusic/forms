import CloseIcon from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import { Button, CircularProgress, IconButton, SxProps, TextField, Theme } from '@mui/material';
import { useState } from 'react';
import { mergeSx } from '../../../mui';
import { TextInputBlock } from '../../textInputBlock';
import { addSpacing } from '../layout';
import ModalView from '../modalView';

export const reactTextInputBlock = (b: TextInputBlock, idx: number, sx?: SxProps<Theme>) => {
  if (b.multiline === true)
    return addSpacing(
      idx,
      <TextField
        error={!!b.error}
        helperText={b.error}
        required={b.required}
        onChange={ev => b.onChange(ev.target.value)}
        label={b.label}
        sx={theme => ({
          width: '320px',
          [theme.breakpoints.only('xs')]: { width: '100%' },
          '&.MuiTextField-root': { m: 0 },
          '& .MuiOutlinedInput-root': { p: 0 },
          '& .MuiOutlinedInput-input': { textOverflow: 'ellipsis', overflow: 'hidden' },
        })}
        value={b.value || ''}
        InputProps={{
          endAdornment: (
            <ModalView
              icon={<Edit />}
              doneButton
              sx={theme => ({
                width: '600px',
                [theme.breakpoints.only('xs')]: { width: '100%', boxSizing: 'border-box' },
              })}
            >
              <TextField
                multiline={true}
                minRows={10}
                maxRows={20}
                error={!!b.error}
                helperText={b.error}
                required={b.required}
                onChange={ev => b.onChange(ev.target.value)}
                label={b.label}
                fullWidth
                inputProps={{ 'max-height': '100%', height: '100%' }}
                sx={{
                  '&.MuiTextField-root': { m: 0 },
                }}
                value={b.value || ''}
              />
            </ModalView>
          ),
        }}
      />
    );

  return addSpacing(idx, <Text sx={sx} b={b} />);
};

const Text = ({ b, sx }: { b: TextInputBlock; sx?: SxProps<Theme> }) => {
  const [state, setState] = useState({ loading: false, error: '' });
  const error = state.error || b.error;
  return (
    <TextField
      error={!!error}
      helperText={error}
      required={b.required}
      onChange={ev => b.onChange(ev.target.value)}
      label={b.label}
      sx={mergeSx(sx, theme => ({
        width: '320px',
        [theme.breakpoints.only('xs')]: { width: '100%' },
        '&.MuiTextField-root': { m: 0 },
        '& .MuiOutlinedInput-input': { textOverflow: 'ellipsis', overflow: 'hidden' },
      }))}
      value={b.value || ''}
      InputProps={{
        endAdornment: (
          <>
            {b.value && (
              <IconButton onClick={() => b.onChange('')} sx={{ mr: '-10px' }}>
                <CloseIcon sx={{ color: 'grey' }} />
              </IconButton>
            )}
            {b.fetchButton && !b.value && !state.loading && (
              <Button
                sx={{ fontSize: '12px', px: '15px', mr: '-5px' }}
                onClick={() => {
                  setState(s => ({ ...s, loading: true }));
                  b.fetchButton!.onClick()
                    .then(res => {
                      if (res._tag === 'Right') {
                        setState(s => ({ ...s, loading: false, error: '' }));
                        b.onChange(res.right);
                      } else setState(s => ({ ...s, loading: false, error: res.left }));
                    })
                    .catch(e => {
                      setState(s => ({ ...s, loading: false, error: e }));
                    });
                }}
              >
                {b.fetchButton.label}
              </Button>
            )}
            {state.loading && <CircularProgress color="primary" size={20} />}
          </>
        ),
      }}
    />
  );
};
