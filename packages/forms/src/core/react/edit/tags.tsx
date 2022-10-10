import { Autocomplete, Chip, TextField, Box } from '@mui/material';
import { Either } from 'fp-ts/lib/Either';
import { useEffect, useState } from 'react';

export type TagsResult = {
  id: string;
  tag: string;
};

export type Tag = {
  id?: string;
  tag: string;
};

const Tags = ({
  error,
  label,
  value,
  onSearch,
  onChange,
  required,
  selectFrom,
}: {
  error?: string;
  required?: boolean;
  label: string;
  value?: Tag[];
  selectFrom?: { tags: TagsResult[]; freeForm: boolean; exposeOptions?: boolean };
  onChange?: (tags: Tag[]) => void;
  onSearch: (keywords: string) => Promise<Either<string, TagsResult[]>>;
}) => {
  const [state, setState] = useState<{
    options: TagsResult[];
    loading: boolean;
    open: boolean;
    value: Tag[];
    otherError: string;
    cancelLastRequest: () => void;
    selectFrom?: Tag[];
  }>({
    options: selectFrom?.tags || [],
    loading: false,
    value: value || [],
    open: false,
    otherError: '',
    selectFrom: selectFrom?.tags.filter(t =>
      value ? value.find(v => v.tag === t.tag) === undefined : true
    ),
    cancelLastRequest: () => {},
  });

  const _width = '420px';

  useEffect(() => {
    value !== state.value &&
      setState(s => ({
        ...s,
        value: value || [],
        selectFrom: selectFrom?.tags.filter(t =>
          value ? value.find(v => v.tag === t.tag) === undefined : true
        ),
      }));
  }, [value]);

  return (
    <>
      <Autocomplete
        freeSolo={selectFrom?.freeForm !== false}
        multiple
        isOptionEqualToValue={(o, v) => (o.id && v.id ? o.id === v.id : o.tag === v.tag)}
        onChange={(_, newValue) => {
          if (newValue === null) {
            setState(s => ({
              ...s,
              value: [],
              selectFrom: selectFrom?.tags,
              otherError: '',
            }));
            return onChange && onChange([]);
          }

          const values = newValue.flatMap(v => {
            if (typeof v === 'string' && v.length > 2) {
              return [{ tag: v }];
            } else if (typeof v === 'object') return [v];
            return [];
          });
          const selectFrom_ = selectFrom?.tags.filter(
            s => values.find(v => v.tag === s.tag) === undefined
          );
          state.cancelLastRequest();
          setState(s => ({
            ...s,
            value: values,
            selectFrom: selectFrom_,
            otherError: '',
            loading: false,
          }));
          onChange && onChange(values);
        }}
        value={state.value}
        sx={theme => ({ width: _width, [theme.breakpoints.only('xs')]: { width: '100%' } })}
        open={state.open}
        onOpen={() => {
          setState(s => ({ ...s, open: true }));
        }}
        onClose={() => {
          setState(s => ({ ...s, open: false }));
        }}
        renderTags={(value: readonly Tag[], getTagProps) =>
          value.map((tag: Tag, index: number) => {
            const { key, ...otherProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                variant="outlined"
                label={tag.tag}
                {...otherProps}
                sx={{
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
        options={state.options}
        loading={state.loading}
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
                if (ev.target.value.length > 2) {
                  state.cancelLastRequest();
                  const { promise, cancel } = cancellablePromise(onSearch(ev.target.value));
                  promise.then(res => {
                    if (res !== 'cancelled')
                      setState(s => ({
                        ...s,
                        loading: false,
                        options:
                          res._tag === 'Right'
                            ? res.right.filter(t => !state.value.map(t_ => t_.tag).includes(t.tag))
                            : [],
                        open: true,
                        otherError: res._tag === 'Left' ? res.left : '',
                      }));
                  });
                  setState(s => ({ ...s, loading: true, cancelLastRequest: cancel }));
                }
              }}
              InputProps={{
                ...InputProps,
              }}
              {...params_}
              variant="outlined"
              placeholder="New tag"
            />
          );
        }}
      />
      {state.selectFrom && selectFrom?.exposeOptions !== false && (
        <Box
          sx={theme => ({
            display: 'flex',
            flexWrap: 'wrap',
            m: '-3px',
            mt: '5px',
            width: _width,
            [theme.breakpoints.only('xs')]: { width: '100%' },
          })}
        >
          {state.selectFrom.map(tag => (
            <Chip
              key={tag.tag}
              sx={{ m: '3px', minWidth: '70px', cursor: 'pointer' }}
              variant="outlined"
              label={tag.tag}
              onClick={() => {
                const values = state.value.concat(tag);
                setState(s => ({
                  ...s,
                  value: values,
                  selectFrom: state.selectFrom?.filter(t => t.tag !== tag.tag),
                }));
                onChange && onChange(values);
              }}
            />
          ))}
        </Box>
      )}
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

export default Tags;
