import LaunchIcon from '@mui/icons-material/Launch';
import TransitEnterexitIcon from '@mui/icons-material/TransitEnterexit';
import Visibility from '@mui/icons-material/Visibility';
import {
  Box,
  Chip,
  Divider,
  FormGroup,
  IconButton,
  Paper,
  Switch,
  Theme,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { format } from 'date-fns';
import Image from 'next/image';
import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { assertNever } from '../../../data';
import Modal from '../../../layout/modal';
import Anchor from '../../../output/Anchor';
import { secondsToHoursMinutesSeconds } from '../../../time';
import { RecordPartial } from '../../record/recordBlockTypes';
import { RecordInputBlock, RecordNestedInputBlock } from '../../record/recordInputBlock';
import { SearchInputBlock } from '../../searchInputBlock';
import { sectionToRecordInputBlock } from '../../sectionInputBlock';
import { ExpandedOption, OptionComponent } from '../edit/reactMultiSelectInputBlock';
import { addSpacing, withBreak } from '../layout';

const ReactViewRecordInput = <R, S extends any[], V>(block: RecordNestedInputBlock<R, S, V>) => {
  return function ReactViewForm(
    props: {
      afterTitle?: JSX.Element;
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
    const [expanded, setExpanded] = useState({} as Record<string, any>);
    const rec = block.apply.block({
      req: other as any,
      get: state,
      set: setState,
      showErrors: false,
    });
    return (
      <Box sx={sx}>
        {title && (
          <Typography fontSize={'22px'} sx={{ mb: '20px' }}>
            {title}
          </Typography>
        )}
        {props.afterTitle ? <Box sx={{ mb: '20px' }}>{props.afterTitle}</Box> : undefined}
        {recordBlock(rec, theme, { expanded, setExpanded })}
      </Box>
    );
  };
};

export const recordBlock: (
  block: RecordInputBlock,
  theme: Theme,
  expandedState: { expanded: Record<string, any>; setExpanded: (e: Record<string, any>) => void }
) => JSX.Element = (block, theme, expandedState) => {
  const minWidth = '100px';
  const maxWidth = '400px';
  const els = block.blocks.flatMap((b, idx) => {
    switch (b.tag) {
      case 'TextInputBlock':
        const suffix = b.suffixImage && (
          <Box sx={{ width: b.suffixImage.width, height: b.suffixImage.height }}>
            <Image
              src={b.suffixImage.image}
              width={b.suffixImage.width}
              height={b.suffixImage.height}
            />
          </Box>
        );
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
                  <Modal
                    openIcon={<Visibility />}
                    primaryButton={{
                      label: 'Done',
                    }}
                    sx={{
                      width: '600px',
                      [theme.breakpoints.only('xs')]: { width: '100%', boxSizing: 'border-box' },
                    }}
                  >
                    <Box sx={{ overflow: 'auto', height: '500px' }}>
                      {label(b.label)}
                      {value(b.value, { whiteSpace: 'pre-wrap' })}
                    </Box>
                  </Modal>
                </Box>
                {suffix}
              </Box>
            )
          : _addSpacing(
              idx,
              <Box sx={{ minWidth, maxWidth }}>
                {label(b.label)}
                {value(b.value)}
                {suffix}
              </Box>
            );

      case 'BooleanInputBlock':
        return _addSpacing(
          idx,
          <Box sx={{ minWidth, maxWidth }}>
            {label(b.label)}
            <Switch sx={{ ml: '-8px' }} readOnly checked={b.value === null ? undefined : b.value} />
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
        return _withBreak(
          idx,
          recordBlock(b, theme, expandedStateAtKey(expandedState, idx.toString())),
          { my: 0 }
        );

      case 'SectionInputBlock':
        return _withBreak(
          idx,
          b.title ? (
            <Box sx={{ [theme.breakpoints.only('xs')]: { width: 'calc(100% - 30px)' } }}>
              <Typography sx={{ color: 'gray', mb: '10px', fontSize: '20px' }}>
                {b.title}
              </Typography>
              {recordBlock(
                sectionToRecordInputBlock(b),
                theme,
                expandedStateAtKey(expandedState, idx.toString())
              )}
              {b.opts?.divider !== false && <Divider sx={{ my: '30px' }} light />}
            </Box>
          ) : (
            recordBlock(
              sectionToRecordInputBlock(b),
              theme,
              expandedStateAtKey(expandedState, idx.toString())
            )
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
                : b.value?.map((v, idx_) => {
                    return (
                      <Paper
                        variant={b.outlined ? 'outlined' : 'elevation'}
                        key={idx_}
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
                          expandedStateAtKey(expandedState, `${idx}_${idx_}`)
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
            {b.label && sectionLabel(b.label)}
            <Box sx={{ mt: '-5px' }}>
              {b.value ? (
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
                    expandedStateAtKey(expandedState, idx.toString())
                  )}
                </Box>
              ) : (
                <Typography>-</Typography>
              )}
            </Box>
          </Box>
        );

      case 'ModalInputBlock':
        const f = b.mode?.type === 'inline' ? _addSpacing : _withBreak;
        return f(
          idx,
          <Box sx={{ minWidth, maxWidth }}>
            {label(b.label)}
            <Box
              sx={{
                display: 'flex',
                ...(b.mode?.type === 'inline'
                  ? { flexDirection: 'row', alignItems: 'center' }
                  : { flexDirection: 'column', alignItems: 'start' }),
              }}
            >
              {b.mode?.type === 'inline' &&
                b.mode.resultLabel &&
                value(b.mode.resultLabel, {
                  mt: '-3px',
                  mr: '10px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  flex: 1,
                })}
              {b.mode?.type === 'multiline' && b.mode.resultLabelLines && (
                <Paper variant="outlined" sx={{ p: '15px', mt: '8px', mb: '10px' }}>
                  <Typography sx={{ mb: '5px' }}>
                    {b.mode.resultLabelLines.map((l, idx) => (
                      <span key={idx}>
                        {idx !== 0 && <br />}
                        {l}
                      </span>
                    ))}
                  </Typography>
                </Paper>
              )}
              <Modal
                openLabel={'View data'}
                primaryButton={{ label: 'Done' }}
                sx={{ minWidth: '70%' }}
                title={
                  b.modalLabelLines && (
                    <Typography>
                      {b.modalLabelLines.map((l, idx) => (
                        <span key={idx}>
                          {idx !== 0 && <br />}
                          {l}
                        </span>
                      ))}
                    </Typography>
                  )
                }
              >
                {recordBlock(
                  b.template(b.value, () => {}),
                  theme,
                  expandedStateAtKey(expandedState, idx.toString())
                )}
              </Modal>
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

      case 'TypedTagsInputBlock':
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
                    <Chip
                      key={idx}
                      variant="outlined"
                      sx={{
                        background: 'white',
                        '& > .MuiChip-label': {
                          paddingLeft: '0px',
                        },
                      }}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip
                            variant="filled"
                            color="secondary"
                            label={b.types.find(t_ => t.type === t_.value)?.label}
                            sx={{
                              mr: '5px',
                              borderRadius: '16px 0 0 16px',
                              fontSize: '12px',
                              '& > .MuiChip-label': {
                                px: '7px',
                              },
                            }}
                          />
                          <Typography sx={{ fontSize: '13px' }}>{t.tag}</Typography>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              value('-')
            )}
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
            {b.selectedSubtitleVisible && b.value?.subtitle && (
              <Typography
                sx={{
                  fontSize: '12px',
                  color: 'rgba(0, 0, 0, 0.6)',
                }}
              >
                {b.value.subtitle}
              </Typography>
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
                {checkedOptions.map((x, idx_) => (
                  <OptionComponent
                    key={idx_}
                    option={x}
                    onChange={() => {}}
                    onExpand={e =>
                      expandedState.setExpanded({ ...expandedState.expanded, [idx_]: e })
                    }
                    expanded={expandedState.expanded[idx_]}
                    value={b.value}
                    level={0}
                    disableRipple={true}
                  />
                ))}
              </Paper>
            ) : (
              <FormGroup sx={{ mt: '-5px' }}>
                {b.options.map((x, idx_) => (
                  <OptionComponent
                    key={idx_}
                    option={x}
                    onChange={() => {}}
                    onExpand={e =>
                      expandedState.setExpanded({ ...expandedState.expanded, [idx_]: e })
                    }
                    expanded={expandedState.expanded[idx_]}
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
      case 'LabelledText':
        return _addSpacing(
          idx,
          <Box sx={{ minWidth, maxWidth }}>
            {label(b.label)}
            {value(b.text)}
          </Box>
        );
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

const expandedStateAtKey = (
  state: { expanded: Record<string, any>; setExpanded: (e: Record<string, any>) => void },
  key: string
) => {
  return {
    expanded: state.expanded[key] || {},
    setExpanded: (s: any) => state.setExpanded({ [key]: s }),
  };
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

const value = (v: string | null, sx?: SxProps<Theme>) => (
  <Typography sx={{ fontSize: '16px', ...sx }}>{v || '-'}</Typography>
);

export default ReactViewRecordInput;
