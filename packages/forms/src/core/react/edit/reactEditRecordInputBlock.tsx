import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Divider, Theme, Typography, useTheme } from '@mui/material';
import { SxProps } from '@mui/system';
import { assertNever, isType, mapLeafTypes } from '../../../data';
import { TextError } from '../../../error';
import { Either } from 'fp-ts/lib/Either';
import _ from 'lodash';
import { NextRouter, useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { useLeavePageConfirm } from '../../../window/leavePage';
import { InputState } from '../../inputBlock';
import { getPartial } from '../../record/recordBlockBuilder';
import { RecordPartial, RecordPartialState, RecordState } from '../../record/recordBlockTypes';
import { RecordInputBlock, RecordNestedInputBlock } from '../../record/recordInputBlock';
import { withError } from '../../validator';
import { addSpacing, withBreak } from '../layout';
import { useFooter } from '../../../layout/footer';
import { reactDateInputBlock } from './reactDateInputBlock';
import { reactDurationInputBlock } from './reactDurationInputBlock';
import { reactListInputBlock } from './reactListInputBlock';
import { reactMultiSelectInputBlock } from './reactMultiSelectInputBlock';
import { reactNumberInputBlock } from './reactNumberInputBlock';
import { reactSearchInputBlock } from './reactSearchInputBlock';
import { reactSelectInputBlock } from './reactSelectInputBlock';
import { reactTagsInputBlock } from './reactTagsInputBlock';
import { reactTextInputBlock } from './reactTextInputBlock';
import { reactToggleInputBlock } from './reactToggleInputBlock';
import { reactValueInputBlock } from './reactValueInputBlock';

const ReactEditRecordInputBlock = <R, S extends any[], V>(
  block: RecordNestedInputBlock<R, S, V>
) => {
  return function ReactForm(
    props: {
      title?: string;
      value?: RecordPartial<S>;
      submitAlwaysEnabled?: boolean;
      onSubmit?: (v: V, edited: Partial<V>, reset: () => void) => Promise<Either<string, any>>;
      onChange?: (s: RecordState<S, V>, p: RecordPartial<S>, v: V | null) => void;
      clearButton?: boolean;
      onClear?: () => void;
      submitLabel?: string;
      inlineSubmit?: boolean;
      sx?: SxProps<Theme>;
    } & R
  ) {
    const { value, onSubmit, inlineSubmit, ...other } = props;
    const setFooter = useFooter();
    const router = useRouter();
    const theme = useTheme();

    const initialState = useMemo(
      () =>
        block.apply.calculateState({
          req: other as any,
          get: null,
          seed: value || null,
        }),
      []
    );

    const [state, setState] = useState({
      data: initialState,
      loading: false,
      submissionState: { error: '', success: false },
      mounted: false,
      value,
    });

    useEffect(() => {
      // This equality check is a hack. It is required because the first time an Apollo mutation request happens it causes a
      // rerender of the whole component containing the form which results for this to be called which resets the form to the
      // previous state. This means if a submit causes an error the first time the form resets to the previous value.
      // An easy way to test this is by removing the email validation from the textInputBlock and submitting an invalid email
      if (!_.isEqual(value, state.value)) {
        setState(s => ({
          ...s,
          data: block.apply.calculateState({
            req: other as any,
            get: null,
            seed: { ...getPartial(s.data), ...(value || null) },
          }),
          prevValue: value,
        }));
      }
      return () => {};
    }, [value]);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
      const queryData = getQueryData(router);
      const initialState = block.apply.calculateState({
        req: other as any,
        get: null,
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
        props.onChange &&
          props.onChange(d, getPartial(d), d.valid._tag === 'Right' ? d.valid.right : null);
        setState(s => ({ ...s, data: d, submissionState: { ...s.submissionState, error: '' } }));
      },
    });

    useLeavePageConfirm(state.data.edited);

    useEffect(() => {
      setState(s => ({ ...s, mounted: true }));
      return () => {
        setState(s => ({ ...s, mounted: false }));
      };
    }, []);

    const inlineSubmitButton = inlineSubmit || !setFooter;

    const submitButton = (
      onSubmit: (v: V, edited: Partial<V>, reset: () => void) => Promise<Either<string, any>>
    ) => {
      let err = '';
      if (state.data.valid._tag === 'Left') {
        err = withError(state.data.valid, state.data.edited);
      }
      return (
        <Box
          sx={{
            display: 'flex',
            ...(inlineSubmitButton
              ? { flexDirection: 'column-reverse', alignItems: 'start' }
              : { flexDirection: 'row', alignItems: 'center' }),
          }}
        >
          {err && (
            <TextError sx={inlineSubmitButton ? { mt: '10px' } : { mr: '10px' }}>{err}</TextError>
          )}
          {state.data.valid._tag !== 'Left' && state.submissionState.error && (
            <TextError sx={inlineSubmitButton ? { mt: '10px' } : { mr: '10px' }}>
              {state.submissionState.error}
            </TextError>
          )}
          {state.submissionState.success && !state.data.edited && (
            <Typography
              sx={theme =>
                inlineSubmitButton
                  ? {
                      mt: '10px',
                      color: theme.palette.success.main,
                      width: '160px',
                      textAlign: 'center',
                    }
                  : { mr: '10px', color: theme.palette.success.main }
              }
            >
              Saved!
            </Typography>
          )}
          <LoadingButton
            loading={state.loading}
            disabled={
              props.submitAlwaysEnabled === true
                ? false
                : state.loading || !state.data.edited || state.data.valid._tag === 'Left'
            }
            sx={{ paddingX: '40px', minWidth: '160px' }}
            variant="contained"
            onClick={() => {
              if (state.data.valid._tag === 'Right') {
                setState(s => ({
                  ...s,
                  loading: true,
                  submissionState: { ...s.submissionState, error: '' },
                }));
                onSubmit(state.data.valid.right, getValidEdited(state.data), () =>
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
            {props.submitLabel || 'Save'}
          </LoadingButton>
          {props.clearButton === true && (
            <Button
              sx={{ ml: '10px', minWidth: '100px' }}
              onClick={() => {
                setState(s => ({
                  ...s,
                  data: block.apply.calculateState({
                    req: other as any,
                    get: null,
                    seed: null,
                  }),
                }));
                props.onClear && props.onClear();
              }}
            >
              Clear
            </Button>
          )}
        </Box>
      );
    };

    useEffect(() => {
      setFooter &&
        !inlineSubmitButton &&
        onSubmit &&
        setFooter({
          footer: submitButton(onSubmit),
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
      <Box sx={{ pt: '10px' }}>
        {props.title && (
          <Typography variant="h6" sx={{ mb: '20px' }}>
            {props.title}
          </Typography>
        )}
        {recordBlock(rec, theme)}
        {inlineSubmitButton && onSubmit && <Box sx={{ my: '30px' }}>{submitButton(onSubmit)}</Box>}
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

const getValidEdited: <S, V>(state: InputState<RecordPartialState<S>, V>) => Partial<V> = state =>
  mapLeafTypes(
    state.partialState,
    isType<InputState<any, any>>(
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

export const recordBlock: (block: RecordInputBlock, theme: Theme) => JSX.Element = (
  block,
  theme
) => {
  const els = block.blocks.flatMap((b, idx) => {
    switch (b.tag) {
      case 'TextInputBlock':
        return reactTextInputBlock(b, idx);

      case 'RecordInputBlock':
        return withBreak(idx, recordBlock(b, theme));

      case 'SectionInputBlock':
        if (b.title) {
          return addSpacing(
            idx,
            <Box sx={{ [theme.breakpoints.only('xs')]: { width: 'calc(100% - 30px)' } }}>
              <Typography sx={{ color: 'gray', mb: '30px', fontSize: '20px' }}>
                {b.title}
              </Typography>
              {recordBlock(b.block, theme)}
              {b.divider !== false && <Divider sx={{ my: '30px' }} light />}
            </Box>,
            {
              my: 0,
            }
          );
        } else return addSpacing(idx, recordBlock(b.block, theme));

      case 'ListInputBlock':
        return reactListInputBlock(b, idx, theme);

      case 'NumberInputBlock':
        return reactNumberInputBlock(b, idx);

      case 'DateInputBlock':
        return reactDateInputBlock(b, idx);

      case 'DurationInputBlock':
        return reactDurationInputBlock(b, idx);

      case 'TagsInputBlock':
        return reactTagsInputBlock(b, idx);

      case 'SearchInputBlock':
        return reactSearchInputBlock(b, idx);

      case 'SelectInputBlock':
        return reactSelectInputBlock(b, idx);

      case 'MultiSelectInputBlock':
        return reactMultiSelectInputBlock(b, idx, theme);

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

      case 'Heading2':
        return withBreak(
          idx,
          <Typography sx={{ fontSize: '15px', color: 'gray' }}>{b.text}</Typography>,
          {
            my: '10px',
          }
        );

      default:
        return assertNever(b);
    }
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        m: '-15px',
      }}
    >
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
