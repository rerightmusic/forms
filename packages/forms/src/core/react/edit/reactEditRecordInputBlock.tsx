import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Divider, Theme, Typography, useTheme } from '@mui/material';
import { SxProps } from '@mui/system';
import { Either } from 'fp-ts/lib/Either';
import _ from 'lodash';
import { NextRouter, useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { assertNever, isType, mapLeafTypes } from '../../../data';
import { TextError } from '../../../error';
import { useFooter } from '../../../layout/footer';
import { mergeSx } from '../../../mui';
import { useLeavePageConfirm } from '../../../window/leavePage';
import { InputState } from '../../inputBlock';
import { getPartial } from '../../record/recordBlockBuilder';
import { RecordPartial, RecordState } from '../../record/recordBlockTypes';
import { RecordInputBlock, RecordNestedInputBlock } from '../../record/recordInputBlock';
import { sectionToRecordInputBlock } from '../../sectionInputBlock';
import { withError } from '../../validator';
import { addSpacing, withBreak } from '../layout';
import { reactDateInputBlock } from './reactDateInputBlock';
import { reactDurationInputBlock } from './reactDurationInputBlock';
import { reactListInputBlock } from './reactListInputBlock';
import { reactModalInputBlock } from './reactModalInputBlock';
import { reactMultiSelectInputBlock } from './reactMultiSelectInputBlock';
import { reactNumberInputBlock } from './reactNumberInputBlock';
import { reactSearchInputBlock } from './reactSearchInputBlock';
import { reactSelectInputBlock } from './reactSelectInputBlock';
import { reactTagsInputBlock } from './reactTagsInputBlock';
import { reactTextInputBlock } from './reactTextInputBlock';
import { reactBooleanInputBlock } from './reactBooleanInputBlock';
import { reactToggleInputBlock } from './reactToggleInputBlock';
import { reactTypedTagsInputBlock } from './reactTypedTagsInputBlock';
import { reactValueInputBlock } from './reactValueInputBlock';

export type SubmitProps<V> = {
  disabled?: boolean;
  hideSubmitButton?: boolean;
  onSubmit?: (v: V, edited: Partial<V>, reset: () => void) => Promise<Either<string, any>>;
  label?: string;
  footer: boolean;
};

const ReactEditRecordInputBlock = <R, S extends any[], V>(
  block: RecordNestedInputBlock<R, S, V>
) => {
  return function ReactForm(
    props: {
      title?: string;
      value?: RecordPartial<S>;
      submit?: SubmitProps<V>;
      onChange?: (s: RecordState<S, V>, p: RecordPartial<S>, v: V | null) => void;
      clearButton?: boolean;
      clearOnChanged?: string;
      onClear?: () => void;
      sx?: SxProps<Theme>;
    } & R
  ) {
    const { value, submit, ...other } = props;
    const setFooter = useFooter();
    const router = useRouter();
    const theme = useTheme();

    const initialState = useMemo(
      () =>
        block.apply.calculateState({
          req: other as any,
          state: null,
          seed: value || null,
        }),
      []
    );

    const [state, setState] = useState({
      data: initialState,
      loading: false,
      submissionState: { error: '', success: false },
      mounted: false,
      initialValue: value,
    });

    useEffect(() => {
      // This equality check is a hack. It is required because the first time an Apollo mutation request happens it causes a
      // rerender of the whole component containing the form which results for this to be called which resets the form to the
      // previous state. This means if a submit causes an error the first time the form resets to the previous value.
      // An easy way to test this is by removing the email validation from the textInputBlock and submitting an invalid email
      if (!_.isEqual(value, state.initialValue)) {
        const calc = block.apply.calculateState({
          req: other as any,
          state: null,
          seed: { ...getPartial(state.data), ...(value || null) },
        });
        setState(s => ({
          ...s,
          data: calc,
        }));
      }
      return () => {};
    }, [value]);

    useEffect(() => {
      if (!_.isEqual(getPartial(state.data), value)) {
        props.onChange &&
          props.onChange(
            state.data,
            getPartial(state.data),
            state.data.valid._tag === 'Right' ? state.data.valid.right : null
          );
      }
    }, [state.data]);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
      const queryData = getQueryData(router);
      const initialState = block.apply.calculateState({
        req: other as any,
        state: null,
        seed: value ? { ...(queryData as any), ...value } : queryData,
      });

      setState(s => ({
        ...s,
        data: { ...initialState, edited: initialState.edited || _.size(queryData) > 0 },
      }));
    }, [router.query]);

    const rec = block.apply.block({
      req: other as R,
      get: state.data,
      set: d => {
        setState(s => ({
          ...s,
          data: d,
          submissionState: { ...s.submissionState, error: '' },
        }));
      },
      showErrors: false,
    });

    const clear = () => {
      setState(s => ({
        ...s,
        data: block.apply.calculateState({
          req: other as any,
          state: null,
          seed: null,
        }),
      }));
      props.onClear && props.onClear();
    };

    useEffect(() => {
      if (props.clearOnChanged !== undefined) clear();
    }, [props.clearOnChanged]);

    useLeavePageConfirm(state.data.edited);

    useEffect(() => {
      setState(s => ({ ...s, mounted: true }));
      return () => {
        setState(s => ({ ...s, mounted: false }));
      };
    }, []);

    const submitButton = (submit: SubmitProps<V>) => {
      let err = '';
      if (state.data.valid._tag === 'Left') {
        err = withError(state.data.valid, state.data.edited, state.data.showErrors);
      }
      return (
        <Box
          sx={theme => ({
            display: 'flex',
            ...(submit?.footer === true
              ? { flexDirection: 'row', alignItems: 'center' }
              : { flexDirection: 'column-reverse', alignItems: 'start' }),
            [theme.breakpoints.only('xs')]: {
              flexDirection: 'column-reverse',
              alignItems: 'center',
              width: '100%',
            },
          })}
        >
          {err && (
            <Box
              sx={{
                ...(submit?.footer === true ? { mr: '10px' } : { mt: '10px' }),
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'start',
                [theme.breakpoints.only('xs')]: {
                  mt: '10px',
                },
                flexWrap: 'wrap',
                mx: '-5px',
                pl: '5px',
                pr: '15px',
                maxWidth: '925px',
              }}
            >
              <TextError>
                <Box component="span" sx={{ display: 'inline', mr: '10px' }}>
                  {err}
                </Box>
                {!state.data.showErrors && (
                  <Button
                    sx={{ m: '-5px' }}
                    size="small"
                    color="warning"
                    onClick={() => setState(s => ({ ...s, data: { ...s.data, showErrors: true } }))}
                  >
                    Highlight
                  </Button>
                )}
              </TextError>
            </Box>
          )}
          {state.data.valid._tag !== 'Left' && state.submissionState.error && (
            <TextError
              sx={
                submit?.footer === true
                  ? { mr: '10px', [theme.breakpoints.only('xs')]: { mt: '10px' } }
                  : { mt: '10px' }
              }
            >
              {state.submissionState.error}
            </TextError>
          )}
          {submit.footer === true && state.submissionState.success && !state.data.edited && (
            <Typography
              sx={theme =>
                submit?.footer === true
                  ? { mr: '10px', color: theme.palette.success.main }
                  : {
                      mt: '10px',
                      color: theme.palette.success.main,
                      width: '160px',
                      textAlign: 'center',
                    }
              }
            >
              Success!
            </Typography>
          )}
          <Box>
            <LoadingButton
              loading={state.loading}
              disabled={
                submit?.disabled === true
                  ? true
                  : submit?.disabled === false
                  ? false
                  : state.loading || !state.data.edited || state.data.valid._tag === 'Left'
              }
              sx={{ paddingX: '40px', minWidth: '160px' }}
              variant="contained"
              onClick={() => {
                if (state.data.valid._tag === 'Right' && submit.onSubmit) {
                  setState(s => ({
                    ...s,
                    loading: true,
                    submissionState: { ...s.submissionState, error: '' },
                  }));
                  submit
                    .onSubmit(state.data.valid.right, getValidEdited(state.data), () =>
                      setState(s => ({ ...s, data: initialState }))
                    )
                    .then(res => {
                      if (state.mounted) {
                        setState(s => {
                          return {
                            ...s,
                            loading: false,
                            data: {
                              ...s.data,
                              edited: res._tag === 'Right' ? false : s.data.edited,
                            },
                            submissionState: {
                              success: res._tag === 'Right',
                              error: res._tag === 'Left' ? res.left : '',
                            },
                          };
                        });
                      }
                    })
                    .catch(_ => {
                      if (state.mounted)
                        setState(s => ({
                          ...s,
                          loading: false,
                          submissionState: { error: 'Something went wrong', success: false },
                        }));
                    });
                }
              }}
            >
              {submit?.label || 'Save'}
            </LoadingButton>
            {props.clearButton === true && (
              <Button sx={{ minWidth: '100px' }} onClick={clear}>
                Clear
              </Button>
            )}
          </Box>
        </Box>
      );
    };

    useEffect(() => {
      submit &&
        submit.footer === true &&
        setFooter({
          footer: submitButton(submit),
          opts: {
            borderColor: state.submissionState.error
              ? theme.palette.error.main
              : state.submissionState.success && !state.data.edited
              ? theme.palette.success.main
              : theme.palette.primary.main,
          },
        });

      return () => setFooter && setFooter({ footer: null });
    }, [state]);

    return (
      <Box>
        {props.title && (
          <Typography variant="h6" sx={{ mb: '20px' }}>
            {props.title}
          </Typography>
        )}
        {recordBlock(rec, theme)}
        {submit && submit.footer !== true && submit.hideSubmitButton !== true && (
          <Box sx={{ mt: '30px' }}>{submitButton(submit)}</Box>
        )}
      </Box>
    );
  };
};

const getQueryData: (router: NextRouter) => object = router => {
  if (router.query) {
    const humanReadable = _.reduce(
      router.query,
      (prev, v, k) => {
        if (k.startsWith('_')) {
          let parsed;
          try {
            parsed = JSON.parse(v as any);
          } catch {}
          return { ...prev, [k.replace('_', '')]: parsed || v };
        } else {
          return prev;
        }
      },
      {}
    );

    const decoded = () => {
      let parsed = {};
      if (router.query['data_b64']) {
        try {
          parsed = JSON.parse(Buffer.from(router.query['data_b64'] as any, 'base64').toString());
        } catch {}
        return parsed;
      }
      return parsed;
    };
    return { ...humanReadable, ...decoded() };
  }
  return {};
};

const getValidEdited: <S extends any[], V>(state: RecordState<S, V>) => Partial<V> = state =>
  mapLeafTypes(
    state.partialState,
    isType<InputState<any, any, any>>(
      v => typeof v === 'object' && 'tag' in v && v.tag === 'InputState'
    ),
    v => {
      if (v.valid._tag === 'Right' && v.edited === true) {
        if (typeof v.partialState === 'object') return getValidEdited(v);
        return v.valid.right;
      }
      return undefined;
    }
  );

export const recordBlock: (
  block: RecordInputBlock,
  theme: Theme,
  sx?: SxProps<Theme>
) => JSX.Element = (block, theme, sx) => {
  const els = block.blocks.flatMap((b, idx) => {
    switch (b.tag) {
      case 'TextInputBlock':
        return reactTextInputBlock(b, idx);

      case 'BooleanInputBlock':
        return reactBooleanInputBlock(b, idx);

      case 'RecordInputBlock':
        return withBreak(idx, recordBlock(b, theme, { p: 0 }));

      case 'SectionInputBlock':
        if (b.title) {
          return withBreak(
            idx,
            <Box sx={{ [theme.breakpoints.only('xs')]: { width: 'calc(100% - 30px)' } }}>
              <Typography sx={{ color: 'gray', mb: '30px', fontSize: '20px' }}>
                {b.title}
              </Typography>
              {recordBlock(sectionToRecordInputBlock(b), theme, { p: 0 })}
              {b.opts?.divider !== false && <Divider sx={{ my: '30px' }} light />}
            </Box>,
            {
              my: 0,
            }
          );
        } else return withBreak(idx, recordBlock(sectionToRecordInputBlock(b), theme, { p: 0 }));

      case 'ListInputBlock':
        return reactListInputBlock(b, idx, theme);

      case 'NumberInputBlock':
        return reactNumberInputBlock(b, idx);

      case 'DateInputBlock':
        return reactDateInputBlock(b, idx);

      case 'DurationInputBlock':
        return reactDurationInputBlock(b, idx);

      case 'TypedTagsInputBlock':
        return reactTypedTagsInputBlock(b, idx);

      case 'TagsInputBlock':
        return reactTagsInputBlock(b, idx);

      case 'SearchInputBlock':
        return reactSearchInputBlock(b, idx);

      case 'SelectInputBlock':
        return reactSelectInputBlock(b, idx);

      case 'MultiSelectInputBlock':
        return reactMultiSelectInputBlock(b, idx);

      case 'ValueInputBlock':
        return reactValueInputBlock(b, idx);

      case 'Break':
        return <Box key={`${idx}_break`} sx={{ flexBasis: '100%', height: 0, mx: '15px' }} />;
      case 'DisplayText':
        return b.text
          ? addSpacing(idx, <Typography sx={{ fontSize: '13px' }}>{b.text}</Typography>)
          : [];
      case 'MultilineText':
        return b.lines.length > 0
          ? addSpacing(
              idx,
              b.lines.map((l, idx) => (
                <Typography key={idx} sx={{ fontWeight: 200, fontSize: '13px' }}>
                  {l}
                </Typography>
              ))
            )
          : [];
      case 'ToggleInputBlock':
        return reactToggleInputBlock(b, idx, theme);

      case 'ModalInputBlock':
        return reactModalInputBlock(b, idx, theme);

      case 'Heading2':
        return withBreak(
          idx,
          <Typography sx={{ fontSize: '15px', color: 'gray' }}>{b.text}</Typography>,
          {
            my: '10px',
          }
        );

      case 'Button':
        return addSpacing(
          idx,
          <Button variant="text" onClick={b.onClick} color="secondary" size="small">
            {b.label}
          </Button>,
          {
            display: 'flex',
            alignItems: 'center',
          }
        );

      default:
        return assertNever(b);
    }
  });

  return (
    <Box sx={mergeSx({ display: 'flex', flexWrap: 'wrap', m: '-15px' }, sx)}>
      {block.label &&
        withBreak(
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

export default ReactEditRecordInputBlock;
