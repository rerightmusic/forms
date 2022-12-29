import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LaunchIcon from '@mui/icons-material/Launch';
import SearchIcon from '@mui/icons-material/Search';
import TransitEnterexitIcon from '@mui/icons-material/TransitEnterexit';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Theme,
  Typography,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { SxProps } from '@mui/system';
import { Either } from 'fp-ts/Either';
import _, { DebouncedFunc } from 'lodash';
import * as React from 'react';
import { isMobile } from 'react-device-detect';
import { mergeSx } from '../mui';
import Anchor from '../output/Anchor';

export type SearchValue<T> = {
  title: string;
  subtitle?: string;
  value: T;
};

export type SearchOption<T> = {
  value: SearchValue<T>;
  idx: number;
  onClick?: () => void;
};

const SearchInput = <T,>({
  error,
  createFromText,
  label,
  selectedSubtitleVisible,
  value,
  sx,
  onSearch,
  createNew,
  placeholder,
  onChange,
  onSelectedClick,
  onSelectedHref,
  required,
  readonly,
  disabled,
  themeColor,
  margin,
  isEqual,
  optionSx,
  hideErrorMessage,
}: {
  createNew?: (value: string) => { label: string; onClick: () => void }[];
  sx?: SxProps<Theme>;
  error?: string;
  createFromText?: (tx: string) => SearchValue<T>;
  isEqual: (t1: T, t2: T) => boolean;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  selectedSubtitleVisible?: boolean;
  label?: string;
  placeholder?: string;
  value?: SearchValue<T>;
  themeColor?: 'light' | 'dark';
  margin?: 'dense' | 'normal';
  onChange: (value: SearchValue<T> | null) => void;
  onSelectedClick?: (selected: SearchValue<T>) => void;
  onSelectedHref?:
    | { href: (selected: SearchValue<T>) => string; explicit: boolean }
    | ((selected: SearchValue<T>) => string);
  onSearch: (keywords: string) => Promise<Either<string, SearchValue<T>[]>>;
  optionSx?: SxProps<Theme>;
  hideErrorMessage?: boolean;
}) => {
  const onSelectedHref_ = onSelectedHref
    ? {
        explicit: typeof onSelectedHref === 'object' ? onSelectedHref.explicit : true,
        href: (v: SearchValue<T>) =>
          typeof onSelectedHref === 'object' ? onSelectedHref.href(v) : onSelectedHref(v),
      }
    : undefined;
  const debouncedSearch = () =>
    _.debounce(
      (value: string) => {
        setState(s => ({
          ...s,
          loading: true,
        }));
        onSearch(value)
          .then(res => {
            setState(s => {
              if (s.loading)
                return {
                  ...s,
                  loading: false,
                  options:
                    res._tag === 'Right' ? res.right.map((value, idx) => ({ value, idx })) : [],
                  open: true,
                  otherError: res._tag === 'Left' ? res.left : '',
                };
              else return s;
            });
          })
          .catch(_ => setState(s => ({ ...s, loading: false })));
      },
      500,
      { trailing: true, leading: false }
    );

  const [state, setState] = React.useState<{
    options: SearchOption<T>[];
    loading: boolean;
    open: boolean;
    selected: SearchValue<T> | null;
    otherError: string;
    value: string;
    mounted: boolean;
    search: DebouncedFunc<(value: string) => void>;
  }>({
    options: [],
    loading: false,
    selected: value || null,
    open: false,
    otherError: '',
    value: '',
    mounted: false,
    search: debouncedSearch(),
  });

  React.useEffect(() => {
    value !== state.selected?.value && setState(s => ({ ...s, selected: value || null }));
  }, [value]);

  const onSelected =
    onSelectedClick !== undefined || (onSelectedHref_ !== undefined && onSelectedHref_.explicit);
  React.useEffect(() => {
    state.mounted && !_.isEqual(state.selected, value) && onChange && onChange(state.selected);
  }, [state.selected]);

  React.useEffect(() => {
    setState(s => ({ ...s, mounted: true }));
  }, []);

  React.useEffect(() => {
    setState(s => ({
      ...s,
      search: debouncedSearch(),
    }));

    return () => {
      state.search.cancel();
    };
  }, [onSearch]);

  return (
    <Autocomplete
      readOnly={readonly}
      freeSolo
      disabled={disabled}
      clearOnBlur={!createFromText}
      onBlur={() => {
        setState(s => ({ ...s, loading: false }));
      }}
      value={state.selected ? { value: state.selected, idx: -1 } : null}
      sx={mergeSx(
        theme => ({
          width: '320px',
          [theme.breakpoints.only('xs')]: { width: '100%' },
          ...(themeColor === 'light'
            ? {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
              }
            : {}),
        }),
        sx
      )}
      open={state.open}
      onClose={() => {
        setState(s => ({ ...s, open: false }));
      }}
      isOptionEqualToValue={(option, value) => isEqual(option.value.value, value.value.value)}
      getOptionLabel={option => (typeof option === 'string' ? option : option.value.title) || ''}
      filterOptions={(options, params) => {
        const { inputValue } = params;
        const isExisting = options.some(
          option => inputValue.toLowerCase() === option.value.title.toLowerCase()
        );
        if (inputValue !== '' && !isExisting) {
          if (createNew) {
            createNew(inputValue).forEach(cn =>
              options.push({
                value: {
                  title: cn.label,
                  value: null as any,
                },
                idx: options.length,
                onClick: cn.onClick,
              })
            );
          } else if (options.length === 0 && !createFromText) {
            options.push({
              value: {
                title: 'No options found',
                value: null as any,
              },
              idx: options.length,
            });
          }
        }

        return options;
      }}
      groupBy={option => (option.onClick ? 'true' : 'false')}
      renderGroup={v => {
        let block;
        if (v.group === 'true' && state.options.length > 0 && createNew && createNew.length > 1) {
          block = (
            <Accordion disableGutters sx={{ border: 0, boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', mt: '5px' }}
                >
                  <Typography sx={{}}>{`Create new "${state.value}"`}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>{v.children}</AccordionDetails>
            </Accordion>
          );
        } else {
          block = v.children;
        }

        return v.group === 'true' && state.options.length > 0 ? (
          <Box key={state.options.length}>
            <Divider sx={{ mt: '5px', mx: '15px', opacity: 0.5 }} />
            {block}
          </Box>
        ) : (
          block
        );
      }}
      renderOption={(_, f, __) => {
        let item;
        if (f.onClick) {
          item = (
            <ListItem
              onClick={f.onClick}
              key={f.idx}
              sx={{
                cursor: 'pointer',
                '&:hover': { background: '#F0F0F0' },
                ...optionSx,
              }}
            >
              <ListItemText primary={f.value.title} secondary={f.value.subtitle} />
            </ListItem>
          );
        } else if (f.value.value) {
          item = (
            <ListItem
              onClick={() => {
                setState(s => ({ ...s, selected: f.value, options: [], open: false }));
              }}
              key={f.idx}
              sx={{ cursor: 'pointer', '&:hover': { background: '#F0F0F0' }, ...optionSx }}
            >
              <ListItemText
                primary={f.value.title}
                secondary={f.value.subtitle}
                sx={{ userSelect: 'none' }}
              />
            </ListItem>
          );
        } else {
          item = (
            <ListItem
              onClick={() => {
                setState(s => ({ ...s, options: [], open: false }));
              }}
              key={f.idx}
              sx={optionSx}
            >
              <ListItemText
                primary={f.value.title}
                secondary={f.value.subtitle}
                sx={{ userSelect: 'none' }}
              />
            </ListItem>
          );
        }
        return onSelectedHref_ && f.value.value ? (
          <Anchor
            key={f.idx}
            onClick={e => e.preventDefault()}
            href={onSelectedHref_.href(f.value)}
          >
            {item}
          </Anchor>
        ) : (
          item
        );
      }}
      options={state.options}
      loading={state.loading}
      onInputChange={ev => {
        if (ev) {
          const value = (ev.target as any).value || '';
          if (value.length > 0 && value !== state.value) {
            setState(s => ({
              ...s,
              value,
              selected: createFromText ? createFromText(value) : s.selected,
            }));
            state.search(value);
          } else {
            setState(s => ({
              ...s,
              selected: createFromText ? createFromText(value) : null,
              value,
              options: [],
              open: false,
            }));
          }
        }
      }}
      renderInput={params => (
        <TextField
          required={required}
          error={!!error || !!state.otherError}
          helperText={
            hideErrorMessage !== true
              ? error ||
                state.otherError ||
                (selectedSubtitleVisible === true && state.selected?.subtitle)
              : ''
          }
          {...params}
          fullWidth
          sx={{
            '&.MuiTextField-root': {
              m: 0,
            },
            '& > .MuiInputBase-root': {
              '&.MuiOutlinedInput-root': {
                paddingRight: '15px',
              },
              ...(margin === 'dense'
                ? {
                    paddingTop: '2px',
                    paddingBottom: '2px',
                  }
                : {}),
              ...(themeColor === 'light' ? { color: 'inherit' } : {}),
            },
            '& .MuiOutlinedInput-notchedOutline': {
              ...(themeColor === 'light' ? { border: 'none' } : {}),
            },
            '& .MuiButtonBase-root': {
              ...(themeColor === 'light' ? { color: 'inherit' } : {}),
            },
            '& > .MuiFormHelperText-root.Mui-error': {
              ...(themeColor === 'light' ? { color: '#FF6E6B' } : {}),
            },
            '& .MuiAutocomplete-clearIndicator': {
              visibility: 'initial',
            },
            '& .MuiAutocomplete-endAdornment': {
              position: 'initial',
            },
          }}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: createFromText ? null : <SearchIcon />,
            endAdornment: (
              <Box
                onClick={e => e.stopPropagation()}
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                {state.loading && (
                  <Box sx={{ width: '20px', display: 'flex' }}>
                    <CircularProgress color="inherit" size={17} />
                  </Box>
                )}
                {state.selected && onSelected && (
                  <a
                    href={onSelectedHref_ ? onSelectedHref_.href(state.selected) : ''}
                    target={isMobile ? '_self' : '_blank'}
                    rel={'noreferrer'}
                  >
                    <IconButton
                      sx={{ p: '4px' }}
                      onClick={() => (onSelectedClick ? onSelectedClick(state.selected!) : {})}
                    >
                      {isMobile ? (
                        <TransitEnterexitIcon sx={{ width: '20px', transform: 'rotate(180deg)' }} />
                      ) : (
                        <LaunchIcon sx={{ width: '20px' }} />
                      )}
                    </IconButton>
                  </a>
                )}
                {readonly !== true && params.InputProps.endAdornment
                  ? params.InputProps.endAdornment
                  : null}
              </Box>
            ),
          }}
        />
      )}
    />
  );
};

export default SearchInput;
