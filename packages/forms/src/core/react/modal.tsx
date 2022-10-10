import { Theme, SxProps } from '@mui/material';
import { Either, right } from 'fp-ts/lib/Either';
import { useMemo, useState } from 'react';
import Modal from '../../layout/modal';
import { RecordBlockBuilder } from '../record/recordBlockBuilder';
import { RecordPartial, RecordState, RecordValid } from '../record/recordBlockTypes';
import ReactEditRecordInputBlock from './edit/reactEditRecordInputBlock';

export const useFormModal = <R extends object, S extends any[]>(
  form: RecordBlockBuilder<R, {}, S>
) => {
  const Form = useMemo(() => form.interpret(ReactEditRecordInputBlock), [form]);
  const [open, setOpen] = useState(false);
  const FormC = useMemo(
    () =>
      (
        props: {
          sx?: SxProps<Theme>;
          value?: RecordPartial<S>;
          submit?: {
            disabled?: boolean;
            onSubmit?: (v: RecordValid<S>) => Promise<Either<string, any>>;
            label?: string;
          };
          onChange?: (
            s: RecordState<S, RecordValid<S>>,
            p: RecordPartial<S>,
            v: RecordValid<S> | null
          ) => void;
          clearButton?: boolean;
          onClear?: () => void;
        } & R
      ) => {
        const [state, setState] = useState<{
          valid: RecordValid<S> | null;
        }>({
          valid: null,
        });

        return (
          <Modal
            sx={props.sx}
            openClose={{ open, onChange: o => setOpen(o) }}
            primaryButton={{
              label: props.submit?.label || 'Submit',
              disabled: props.submit?.disabled,
              onClick: () => {
                return (
                  (state.valid && props.submit?.onSubmit && props.submit.onSubmit(state.valid)) ||
                  Promise.resolve(right({}))
                );
              },
            }}
            secondaryButton={{
              label: 'Back',
            }}
          >
            <Form
              {...props}
              submit={{
                footer: false,
                hideSubmitButton: true,
              }}
              onChange={(a, b, v) => {
                v !== null && setState(s => ({ ...s, valid: v }));
                props.onChange && props.onChange(a, b, v);
              }}
            />
          </Modal>
        );
      },
    [open]
  );

  return {
    Form: FormC,
    open: () => {
      setOpen(true);
    },
    close: () => setOpen(false),
  };
};
