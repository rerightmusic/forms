import { Autocomplete, Box, Chip, Paper, TextField, Typography, useTheme } from '@mui/material';
import { Either } from 'fp-ts/lib/Either';
import { useEffect, useState } from 'react';
import { Loader } from '../../../loaders';
import _ from 'lodash';
import AddCircle from '@mui/icons-material/AddCircle';

export type PartialTypedTag<T extends string> = {
  id?: string;
  type: T;
  tag: string;
};

export type TypedTag<T extends string> = {
  id: string;
  type: T;
  tag: string;
};

const TypedTags = <T extends string>({
  error,
  label,
  types,
  value,
  selectedType,
  onSearch,
  onChange,
  required,
  width,
  allowNewTags,
}: {
  error?: string;
  required?: boolean;
  label: string;
  types: { label: string; value: T }[];
  value?: PartialTypedTag<T>[];
  selectedType?: { label: string; value: T };
  width?: string;
  allowNewTags?: boolean;
  onChange?: (tags: PartialTypedTag<T>[]) => void;
  onSearch: (props: { keywords?: string; type: T }) => Promise<Either<string, TypedTag<T>[]>>;
}) => {
  const [state, setState] = useState<{
    options: TypedTag<T>[];
    filteredOptions: TypedTag<T>[];
    loading: boolean;
    open: boolean;
    value: PartialTypedTag<T>[];
    otherError: string;
    textValue: string;
    cancelLastRequest: () => void;
    selectedType: { label: string; value: T };
  }>({
    textValue: '',
    filteredOptions: [],
    options: [],
    loading: false,
    value: value || [],
    selectedType: selectedType || types[0],
    open: false,
    otherError: '',
    cancelLastRequest: () => {},
  });

  const theme = useTheme();

  const addValue = (value: string | PartialTypedTag<T>) => {
    let newTag: PartialTypedTag<T> | null = null;
    if (typeof value === 'string' && value.length > 2) {
      const existingTag = state.options.find(o => o.tag.toLowerCase() === value.toLowerCase());
      newTag = {
        id: existingTag?.id,
        type: state.selectedType.value,
        tag: existingTag ? existingTag.tag : value,
      };
    } else if (typeof value === 'object') newTag = value;

    if (newTag !== null) {
      const duplicateFound = state.value.find(x => {
        return x.tag.toLowerCase() === newTag!.tag.toLowerCase() && newTag!.type === x.type;
      });
      if (duplicateFound) return changeValue(state.value);
      return changeValue(state.value.concat(newTag));
    }
  };

  const changeValue = (value: PartialTypedTag<T>[], callOnChange: boolean = true) => {
    setState(s => ({
      ...s,
      value,
      textValue: '',
      filteredOptions: s.options.filter(
        x =>
          value.find(v_ => v_.tag.toLowerCase() === x.tag.toLowerCase() && v_.type === x.type) ===
          undefined
      ),
    }));

    callOnChange && onChange && onChange(value);
  };

  useEffect(() => {
    setState(s => ({ ...s, options: [], filteredOptions: [], loading: true }));
    const { promise, cancel } = cancellablePromise(onSearch({ type: state.selectedType.value }));
    promise
      .then(x => {
        if (x !== 'cancelled' && x._tag === 'Right') {
          const filteredOptions = x.right.filter(
            t =>
              t.type === state.selectedType.value &&
              value?.find(v => v.type === state.selectedType.value && v.id === t.id) === undefined
          );

          setState(s => ({ ...s, options: x.right, filteredOptions, loading: false }));
        }
      })
      .catch(() => setState(s => ({ ...s, loading: false })));
    return () => cancel();
  }, [state.selectedType]);

  const _width = width || '420px';

  useEffect(() => {
    const orderedValue = _.sortBy(value, i => {
      const idx = state.value.findIndex(x => x.id === i.id && x.type === i.type);
      if (idx === -1) return value?.length;
      return idx;
    });
    if (
      _.differenceWith(orderedValue, state.value, (a, b) => a.id === b.id && a.type === b.type)
        .length > 0
    )
      changeValue(orderedValue || [], false);
    else if (
      _.differenceWith(state.value, orderedValue, (a, b) => a.id === b.id && a.type === b.type)
        .length > 0
    )
      changeValue(orderedValue || [], false);
  }, [value]);

  return (
    <>
      <Autocomplete
        freeSolo={allowNewTags !== false}
        multiple
        isOptionEqualToValue={(o, v) => {
          if (o.type === v.type) {
            if (o.id && v.id) return o.id === v.id;
            return o.tag.toLowerCase() === v.tag.toLowerCase();
          }
          return false;
        }}
        onChange={(_, newValue, reason) => {
          if (['selectOption', 'createOption'].includes(reason)) {
            return addValue(newValue[newValue.length - 1]);
          }
          return changeValue(newValue.flatMap(x => (typeof x !== 'string' ? [x] : [])));
        }}
        value={state.value}
        sx={theme => ({
          width: _width,
          [theme.breakpoints.only('xs')]: { width: '100%' },
          '& .MuiOutlinedInput-notchedOutline': { borderRadius: '4px 4px 0 0' },
        })}
        open={false}
        options={state.options}
        renderTags={(value: readonly PartialTypedTag<T>[], getTagProps) =>
          value.map((tag: PartialTypedTag<T>, index: number) => {
            const { key, ...otherProps } = getTagProps({ index });
            return (
              <Chip
                key={index}
                variant="outlined"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {!tag.id && (
                      <AddCircle
                        sx={{
                          position: 'absolute',
                          top: '-7px',
                          left: '-9px',
                          fontSize: '20px',
                          color: '#50c878',
                        }}
                      />
                    )}
                    <Chip
                      variant="filled"
                      color="secondary"
                      label={types.find(x => x.value === tag.type)?.label}
                      sx={{
                        mr: '5px',
                        borderRadius: '16px 0 0 16px',
                        fontSize: '12px',
                        '& > .MuiChip-label': {
                          px: '7px',
                        },
                      }}
                    />
                    <Typography sx={{ fontSize: '13px' }}>{tag.tag}</Typography>
                  </Box>
                }
                {...otherProps}
                sx={{
                  background: 'white',
                  '& > .MuiChip-label': {
                    paddingLeft: '0px',
                  },
                  '& .MuiChip-deleteIconOutlinedColorDefault': {
                    color: '#d32f2f',
                    '&:hover': { color: '#aa2424' },
                  },
                }}
              />
            );
          })
        }
        getOptionLabel={o => (typeof o === 'string' ? o : o.tag)}
        renderInput={params => {
          const { InputProps, ...params_ } = params;
          return (
            <TextField
              required={required}
              error={!!error || !!state.otherError}
              helperText={error || state.otherError}
              sx={{
                '&.MuiTextField-root': { m: 0 },
              }}
              label={label}
              onChange={ev => {
                if (ev.target.value.length > 0)
                  setState(s => ({
                    ...s,
                    textValue: ev.target.value,
                    filteredOptions: state.options.filter(x =>
                      x.tag.toLowerCase().includes(ev.target.value.toLowerCase())
                    ),
                  }));
                else
                  setState(s => ({
                    ...s,
                    textValue: ev.target.value,
                    filteredOptions: state.options,
                  }));
              }}
              InputProps={{
                ...InputProps,
              }}
              {...{ ...params_, inputProps: { ...params_.inputProps, value: state.textValue } }}
              variant="outlined"
              placeholder="New tag"
            />
          );
        }}
      />
      <Paper
        variant="outlined"
        sx={theme => ({
          p: '10px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          width: _width,
          borderTop: 0,
          borderRadius: '0 0 4px 4px',
          [theme.breakpoints.only('xs')]: { width: '100%' },
        })}
      >
        <Box
          sx={theme => ({
            display: 'flex',
            flexWrap: 'wrap',
            m: '-3px',
            mt: '5px',
            mb: '10px',
            width: _width,
            [theme.breakpoints.only('xs')]: { width: '100%' },
          })}
        >
          {types.map((t, idx) => (
            <Chip
              key={idx}
              label={t.label}
              color="primary"
              variant={t.value === state.selectedType.value ? 'filled' : 'outlined'}
              onClick={() => setState(s => ({ ...s, selectedType: t }))}
              sx={{
                m: '3px',
                minWidth: '70px',
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
        {state.loading && (
          <Box sx={{ width: '100%', height: '70px', position: 'relative' }}>
            <Loader color={theme.palette.primary.main} loader="pulse-out" />
          </Box>
        )}
        {state.textValue.length > 0 && allowNewTags !== false && (
          <Box sx={{ mb: '10px', display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '13px', mr: '5px' }}>
              Press Enter or click to add
            </Typography>
            <Chip
              variant="outlined"
              onClick={() => {
                addValue({ type: state.selectedType.value, tag: state.textValue });
              }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    variant="filled"
                    color="secondary"
                    label={state.selectedType.label}
                    sx={{
                      mr: '5px',
                      borderRadius: '16px 0 0 16px',
                      fontSize: '12px',
                      '& > .MuiChip-label': {
                        px: '7px',
                      },
                      cursor: 'pointer',
                    }}
                  />
                  <Typography sx={{ fontSize: '13px' }}>{state.textValue}</Typography>
                </Box>
              }
              sx={{
                background: 'white',
                '& > .MuiChip-label': {
                  paddingLeft: '0px',
                },
              }}
            />
          </Box>
        )}
        <Box
          sx={{
            overflow: 'auto',
            maxHeight: '180px',
            mx: '-3px',
            position: 'relative',
            pt: '10px',
          }}
        >
          {state.filteredOptions.map(tag => (
            <Chip
              key={tag.tag}
              sx={{ m: '3px', minWidth: '70px', cursor: 'pointer' }}
              variant="outlined"
              label={tag.tag}
              onClick={() => {
                addValue(tag);
              }}
            />
          ))}
        </Box>
      </Paper>
    </>
  );
};

export const cancellablePromise = <T,>(promise: Promise<T>) => {
  const isCancelled = { value: false };
  const wrappedPromise = new Promise((res, rej) => {
    promise.then(d => {
      return isCancelled.value ? res('cancelled') : res(d);
    });
  });

  return {
    promise: wrappedPromise as Promise<T | 'cancelled'>,
    cancel: () => {
      isCancelled.value = true;
    },
  };
};

export default TypedTags;
