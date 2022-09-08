import { Either } from 'fp-ts/lib/Either';
import { useMemo, useState } from 'react';
import Modal from '../../layout/modal';
import { RecordBlockBuilder } from '../record/recordBlockBuilder';
import { RecordValid } from '../record/recordBlockTypes';
import ReactEditRecordInputBlock from './edit/reactEditRecordInputBlock';

export const useFormModal = <S extends any[]>(
  form: RecordBlockBuilder<{}, {}, S>,
  submitLabel: string,
  alwaysEnabled: boolean,
  onSubmit: (v: RecordValid<S>) => Promise<Either<string, any>>
) => {
  const Form = useMemo(() => form.interpret(ReactEditRecordInputBlock), [form]);
  const [state, setState] = useState(false);
  return {
    view: () => (
      <Modal onClose={() => setState(false)} open={state}>
        {
          <Form
            submit={{
              footer: false,
              alwaysEnabled,
              onSubmit: v => {
                setState(false);
                return onSubmit(v);
              },
              label: submitLabel,
            }}
          />
        }
      </Modal>
    ),
    open: () => setState(true),
    close: () => setState(false),
  };
};
