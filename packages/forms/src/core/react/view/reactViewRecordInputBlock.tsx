import LaunchIcon from '@mui/icons-material/Launch';
import TransitEnterexitIcon from '@mui/icons-material/TransitEnterexit';
import Visibility from '@mui/icons-material/Visibility';
import { Box, Chip, Divider, FormGroup, IconButton, Paper, Theme, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { assertNever } from '../../../data';
import Anchor from '../../../output/Anchor';
import { secondsToHoursMinutesSeconds } from '../../../time';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { RecordPartial } from '../../record/recordBlockTypes';
import { RecordInputBlock, RecordNestedInputBlock } from '../../record/recordInputBlock';
import { SearchInputBlock } from '../../searchInputBlock';
import { ExpandedOption, OptionComponent } from '../edit/reactMultiSelectInputBlock';
import { addSpacing, withBreak } from '../layout';
import ModalView from '../modalView';

const ReactViewRecordInput = <R, S extends any[], V>(block: RecordNestedInputBlock<R, S, V>) => {
  return function ReactViewForm(
    props: {
      value: RecordPartial<S>;
      sx?: SxProps<Theme>;
      title?: string;
    } & R
  ) {
    const { value, title, sx, ...other } = props;
    const theme = useTheme();
    const initialState = block.apply.calculateState({
      req: other as any,
      state: null,
      seed: value || null,
    });
    const [state, setState] = useState(initialState);
    const [expanded, setExpanded] = useState({} as Record<string, ExpandedOption>);

    const rec = block.apply.block({
      req: other as any,
      get: state,
      set: setState,
    });
    return (
      <Box sx={{ pl: '2px', ...sx }}>
        {title && <Typography fontSize={'22px'}>{title}</Typography>}
        {recordBlock(rec, theme, expanded, setExpanded)}
      </Box>
    );
  };
};

export const recordBlock: (
  block: RecordInputBlock,
  theme: Theme,
  expanded: Record<string, ExpandedOption>,
  setExpanded: (e: Record<string, ExpandedOption>) => void
) => JSX.Element = (block, theme, expanded, setExpanded) => {
  const minWidth = '100px';
  const maxWidth = '400px';
  const els = block.blocks.flatMap((b, idx) => {
    switch (b.tag) {
      case 'TextInputBlock':
        return b.multiline === true
          ? _withBreak(
              idx,
              <Box sx={{ minWidth }}>
                {label(b.label)}
                <Box
                  sx={theme => ({
                    display: 'flex',
                    alignItems: 'center',

                    maxWidth: '320px',
                    [theme.breakpoints.only('xs')]: { maxWidth: 'calc(100% - 25px)' },
                    mt: '-2px',
                  })}
                >
                  {value(b.value, {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  })}
                  <ModalView
                    icon={<Visibility />}
                    doneButton
                    sx={{
                      width: '600px',
                      [theme.breakpoints.only('xs')]: { width: '100%', boxSizing: 'border-box' },
                    }}
                  >
                    <Box sx={{ overflow: 'auto', height: '500px' }}>
                      {label(b.label)}
                      {value(b.value, { whiteSpace: 'pre-wrap' })}
                    </Box>
                  </ModalView>
                </Box>
              </Box>
            )
          : _addSpacing(
              idx,
              <Box sx={{ minWidth, maxWidth }}>
                {label(b.label)}
                {value(b.value)}
              </Box>
            );
      case 'DateInputBlock':
        return _addSpacing(
          idx,
          <Box sx={{ minWidth, maxWidth }}>
            {label(b.label)}
            {value(b.value ? format(b.value, b.yearOnly === true ? 'yyyy' : 'MM-dd-yyyy') : null)}
          </Box>
        );
      case 'DurationInputBlock':
        return _addSpacing(
          idx,
          <Box sx={{ minWidth, maxWidth }}>
            {label(b.label)}
            {value(b.value ? secondsToHoursMinutesSeconds(b.value) : null)}
          </Box>
        );

      case 'RecordInputBlock':
        return _withBreak(idx, recordBlock(b, theme, expanded, setExpanded), { my: 0 });

      case 'SectionInputBlock':
        return _withBreak(
          idx,
          b.title ? (
            <Box sx={{ [theme.breakpoints.only('xs')]: { width: 'calc(100% - 30px)' } }}>
              <Typography sx={{ color: 'gray', mb: '15px', fontSize: '20px' }}>
                {b.title}
              </Typography>
              {recordBlock(b.block, theme, expanded, setExpanded)}
              {b.divider !== false && <Divider sx={{ my: '30px' }} light />}
            </Box>
          ) : (
            recordBlock(b.block, theme, expanded, setExpanded)
          ),
          {
            my: 0,
          }
        );

      case 'ListInputBlock':
        return _withBreak(
          idx,
          <Box>
            {b.label && sectionLabel(b.label)}
            <Box
              sx={{
                m: '-10px',
                display: 'flex',
                flexWrap: 'wrap',
                flexDirection: b.noinline === true ? 'column' : 'row',
              }}
            >
              {!b.value || b.value.length === 0
                ? value('-', { ml: '10px' })
                : b.value?.map((v, idx) => {
                    return (
                      <Paper
                        variant={b.outlined ? 'outlined' : 'elevation'}
                        key={idx}
                        sx={{
                          p: '15px',
                          py: '5px',
                          position: 'relative',
                          m: '10px',
                        }}
                      >
                        {recordBlock(
                          b.template(v, () => {}),
                          theme,
                          expanded,
                          setExpanded
                        )}
                      </Paper>
                    );
                  })}
            </Box>
          </Box>,
          theme => ({ [theme.breakpoints.only('xs')]: { width: 'calc(100% - 30px)' } })
        );

      case 'ToggleInputBlock':
        return _withBreak(
          idx,
          <Box>
            {b.label && subSectionLabel(b.label)}
            <Box sx={{ mt: '-5px' }}>
              {b.value && (
                <Box
                  key={idx}
                  sx={{
                    p: '15px',
                    py: '0px',
                    mx: '-15px',
                    position: 'relative',
                  }}
                >
                  {recordBlock(
                    b.template(b.value, () => {}),
                    theme,
                    expanded,
                    setExpanded
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 'NumberInputBlock':
        return _addSpacing(
          idx,
          <Box sx={{ minWidth, maxWidth }}>
            {label(b.label)}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {value(b.value)}
              <Typography sx={{ ml: '3px', color: '#505050', display: 'inline', fontSize: '15px' }}>
                {b.suffix && b.value ? ` ${b.suffix}` : ''}
              </Typography>
            </Box>
          </Box>
        );

      case 'TagsInputBlock':
        return _addSpacing(
          idx,
          <Box sx={{ minWidth, maxWidth }}>
            {label(b.label)}
            {b.value && b.value.length > 0 ? (
              <Box
                sx={{ m: '-3px', mt: '0px', display: 'flex', flexWrap: 'wrap', maxWidth: '300px' }}
              >
                {b.value.map((t, idx) => (
                  <Box key={idx} sx={{ m: '3px', my: '3px' }}>
                    <Chip key={idx} variant="outlined" label={t.tag} />
                  </Box>
                ))}
              </Box>
            ) : (
              value('-')
            )}
          </Box>
        );

      case 'SearchInputBlock':
        return _addSpacing(
          idx,
          <Box sx={{ minWidth, maxWidth }}>
            {label(b.label)}
            {b.value?.title ? (
              <SearchWrapper
                b={b}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: b.onSelectedClick || b.onSelectedHref ? '-4px' : 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '16px',
                  }}
                >
                  {b.value?.title}
                </Typography>
                {b.onSelectedHref || b.onSelectedClick ? (
                  <IconButton sx={{ p: '4px' }}>
                    {isMobile ? (
                      <TransitEnterexitIcon sx={{ width: '20px', transform: 'rotate(180deg)' }} />
                    ) : (
                      <LaunchIcon sx={{ width: '20px' }} />
                    )}
                  </IconButton>
                ) : null}
              </SearchWrapper>
            ) : (
              value(null)
            )}
          </Box>
        );
      case 'SelectInputBlock':
        return _addSpacing(
          idx,
          <>
            {label(b.label)}
            {value(b.options.find(o => o.value === b.value)?.name || null)}
          </>
        );
      case 'MultiSelectInputBlock':
        const checkedOptions = b.options.filter(x => !!b.value?.find(o => o.value === x.value));
        return _withBreak(
          idx,
          <>
            {label(b.label)}
            {b.dropdown === true ? (
              <Paper
                sx={{
                  overflow: 'auto',
                  maxHeight: '190px',
                  minWidth: '200px',
                  p: '0px 15px',
                }}
                variant="outlined"
              >
                {checkedOptions.map((x, idx) => (
                  <OptionComponent
                    key={idx}
                    option={x}
                    onChange={() => {}}
                    onExpand={e => setExpanded({ ...expanded, [x.value]: e })}
                    expanded={expanded[x.value]}
                    value={b.value}
                    level={0}
                    disableRipple={true}
                  />
                ))}
              </Paper>
            ) : (
              <FormGroup sx={{ mt: '-5px' }}>
                {b.options.map((x, idx) => (
                  <OptionComponent
                    key={idx}
                    option={x}
                    onChange={() => {}}
                    onExpand={e => setExpanded({ ...expanded, [x.value]: e })}
                    expanded={expanded[x.value]}
                    value={b.value}
                    level={0}
                    disableRipple={true}
                  />
                ))}
              </FormGroup>
            )}
          </>,
          { my: '5px', mx: '15px' }
        );
      case 'Break':
        return <Box key={`${idx}_break`} sx={{ flexBasis: '100%', height: 0, mx: '15px' }} />;
      case 'DisplayText':
        return b.text
          ? _addSpacing(
              idx,
              <Typography sx={{ fontWeight: 200, fontSize: '13px' }}>{b.text}</Typography>
            )
          : [];
      case 'MultilineText':
        return b.lines.length > 0
          ? _addSpacing(
              idx,
              <Box>
                {b.lines.map((l, idx) => (
                  <Typography key={idx} sx={{ fontWeight: 200, fontSize: '13px' }}>
                    {l}
                  </Typography>
                ))}
              </Box>,
              {
                mt: '10px',
              }
            )
          : [];

      case 'ValueInputBlock':
        return _addSpacing(
          idx,
          <Box sx={{ minWidth, maxWidth }}>
            {label(b.label || 'Computed Value')}
            {value(b.value)}
          </Box>
        );

      case 'Heading2':
        return _withBreak(
          idx,
          <Typography sx={{ fontSize: '15px', color: 'gray' }}>{b.text}</Typography>,
          {
            my: '5px',
          }
        );

      case 'Button':
        return [];

      default:
        return assertNever(b);
    }
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        my: '0px',
        mx: '-15px',
      }}
    >
      {block.label &&
        _withBreak(
          'title',
          <>
            <Typography sx={{ fontWeight: '300' }} variant="h6">
              {block.label}
            </Typography>
          </>
        )}
      {els}
    </Box>
  );
};

const SearchWrapper = <T,>({
  children,
  sx,
  b,
}: {
  b: SearchInputBlock<T>;
  sx: SxProps<Theme>;
  children: React.ReactNode;
}) => {
  if (b.onSelectedHref || b.onSelectedClick)
    return (
      <Box sx={sx} onClick={() => (b.onSelectedClick ? b.onSelectedClick(b.value!) : {})}>
        <Anchor
          sx={{ display: 'flex', alignItems: 'center' }}
          href={b.onSelectedHref && b.value ? b.onSelectedHref(b.value) : ''}
          target={isMobile ? '_self' : '_blank'}
        >
          {children}
        </Anchor>
      </Box>
    );

  return <Box sx={sx}>{children}</Box>;
};

const _addSpacing = (idx: number | string, el: React.ReactNode, sx?: SxProps<Theme>) =>
  addSpacing(idx, el, { my: '10px', mx: '15px', ...sx });

const _withBreak = (idx: number | string, el: React.ReactNode, sx?: SxProps<Theme>) =>
  withBreak(idx, el, { mx: '15px', my: '10px', ...sx });

const label = (str: string) => (
  <Typography sx={{ fontSize: '13px', color: 'gray', mb: '5px' }}>{str}</Typography>
);

const sectionLabel = (str: string) => (
  <Typography sx={{ fontSize: '15px', color: 'gray', mb: '5px' }}>{str}</Typography>
);

const subSectionLabel = (str: string) => (
  <Typography sx={{ fontSize: '14px', color: 'gray', mb: '5px', fontWeight: '550' }}>
    {str}
  </Typography>
);

const value = (v: string | null, sx?: SxProps<Theme>) => (
  <Typography sx={{ fontSize: '16px', ...sx }}>{v || '-'}</Typography>
);

export default ReactViewRecordInput;
