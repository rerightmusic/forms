import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { TextError } from '../error';

export type ListComponentProps<T> = {
  id?: string;
  error?: string;
  label?: string;
  labelButton?: {
    onClick: () => void;
    label: string;
  };
  addLabel?: string;
  itemLabel?: string;
  createEmpty?: number;
  value?: T[];
  required?: boolean;
  outlined?: boolean;
  noinline?: boolean;
  buildEmptyValue: () => T;
  template: (data: T, onChange: (data: T) => void, idx: number) => React.ReactNode;
  onChange: (data: T[], change: { type: 'edit' | 'delete' | 'add'; value?: T }) => void;
};

const ListComponent = <T,>({
  id,
  label,
  labelButton,
  addLabel,
  itemLabel,
  createEmpty,
  required,
  template,
  error,
  value = [],
  outlined,
  noinline,
  onChange,
  buildEmptyValue,
}: ListComponentProps<T>) => {
  useEffect(() => {
    if (createEmpty && createEmpty > 0 && value.length === 0) {
      onChange(new Array(createEmpty).fill(buildEmptyValue()), { type: 'add' });
    }
  }, []);
  const [deleted, setDeleted] = useState(new Set<number>());
  const deleteId = (id: number) => {
    setDeleted(new Set([...deleted, id]));
  };

  const dataAndIds = value.reduce<{
    idx: number;
    data: { id: number; value: T }[];
  }>(
    (prev, next) => {
      let idx_ = prev.idx;
      while (deleted.has(idx_)) {
        idx_ += 1;
      }
      return { idx: idx_ + 1, data: prev.data.concat({ id: idx_, value: next }) };
    },
    { idx: 0, data: [] }
  ).data;

  const els = dataAndIds.map((itemValue, idx) => {
    const itemForm = template(
      itemValue.value,
      currItemData => {
        onChange(
          value
            .slice(0, idx)
            .concat([currItemData])
            .concat(value.slice(idx + 1)),
          { type: 'edit', value: currItemData }
        );
      },
      idx
    );

    return (
      <Paper
        variant={outlined ? 'outlined' : 'elevation'}
        sx={theme => ({
          py: '30px',
          pl: '30px',
          pr: '50px',
          [theme.breakpoints.only('xs')]: {
            pt: '35px',
            pb: '30px',
            pl: '15px',
            pr: '45px',
          },
          position: 'relative',
          borderRadius: '4px 0px 4px 4px',
        })}
      >
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            right: '-1px',
            top: '-1px',
            borderRadius: '0px 4px 0px 4px',
            background: '#ededed',
            borderColor: '#ededed',
            borderBottomWidth: '1.5px',
          }}
          variant="outlined"
        >
          {itemLabel && (
            <Typography sx={{ fontSize: '14px', mx: '15px', color: '#666666', fontWeight: '500' }}>
              {itemLabel.toUpperCase()}
            </Typography>
          )}
          <Button
            variant="contained"
            color="error"
            size="small"
            aria-label="delete"
            sx={{
              minWidth: '40px',
              borderRadius: '0px 4px 0px 0px',
            }}
            onClick={() => {
              deleteId(itemValue.id);
              onChange(
                dataAndIds.filter(v => v.id !== itemValue.id).map(x => x.value),
                { type: 'delete' }
              );
            }}
          >
            <CloseIcon sx={{ fontSize: '20px' }} />
          </Button>
        </Paper>
        <Box sx={{ mt: '20px' }}>{itemForm}</Box>
      </Paper>
    );
  });

  return (
    <Box id={id}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {label ? (
          <Typography sx={{ fontSize: '16px', color: 'gray' }}>
            {label}
            {required === true ? <span style={{ marginLeft: '2px' }}>*</span> : null}
          </Typography>
        ) : null}
        {labelButton && (
          <Button sx={{ ml: '10px' }} onClick={labelButton.onClick} color="secondary" size="small">
            {labelButton.label}
          </Button>
        )}
      </Box>
      {els.length > 0 && (
        <Box sx={{ mt: '10px' }}>
          <Box
            sx={{
              m: '-10px',
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: noinline === true ? 'column' : 'row',
            }}
          >
            {els.map((el, idx) => (
              <Box
                key={idx}
                sx={theme => ({
                  m: '10px',
                  [theme.breakpoints.only('xs')]: { width: '100%' },
                })}
              >
                {el}
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {error && <TextError sx={{ mt: '10px' }}>{error}</TextError>}
      <Button
        onClick={() => onChange(value.concat(buildEmptyValue()), { type: 'add' })}
        sx={{ ml: '-8px', mt: '5px' }}
      >
        {addLabel || 'Add'}
      </Button>
    </Box>
  );
};

export default ListComponent;
