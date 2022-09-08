import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  IconButton,
  InputLabel,
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Select from '@mui/material/Select';
import { useState } from 'react';
import { MultiSelectInputBlock, Option, SelectedOption } from '../../multiSelectInputBlock';
import { addSpacing, withBreak } from '../layout';

export const reactMultiSelectInputBlock = (b: MultiSelectInputBlock, idx: number) => {
  return b.dropdown === true
    ? addSpacing(
        idx,
        <MultiSelect
          key={idx}
          label={b.label}
          error={b.error}
          options={b.options}
          required={b.required}
          value={b.value}
          onChange={b.onChange}
          dropdown={b.dropdown}
        />
      )
    : withBreak(
        idx,
        <MultiSelect
          key={idx}
          label={b.label}
          error={b.error}
          options={b.options}
          required={b.required}
          value={b.value}
          onChange={b.onChange}
          dropdown={b.dropdown}
        />,
        { mb: '0px', mt: '5px' }
      );
};

export const MultiSelect = ({
  label,
  error,
  options,
  required,
  value,
  onChange,
  dropdown,
}: {
  label: string;
  error?: string;
  options: Option[];
  required?: boolean;
  value: SelectedOption[] | null;
  onChange: (value: SelectedOption[]) => void;
  dropdown?: boolean;
}) => {
  const [expanded, setExpanded] = useState(null as ExpandedOption | null);
  return (
    <>
      {dropdown === true ? (
        <DropdownMultiSelect
          label={label}
          error={error}
          options={options}
          required={required}
          value={value}
          onChange={onChange}
          expanded={expanded}
          onExpand={setExpanded}
        />
      ) : (
        <InlineMultiSelect
          label={label}
          error={error}
          options={options}
          required={required}
          value={value}
          onChange={onChange}
          expanded={expanded}
          onExpand={setExpanded}
        />
      )}
    </>
  );
};

const DropdownMultiSelect = ({
  label,
  error,
  options,
  required,
  value,
  onChange,
  onExpand,
  expanded,
}: {
  label: string;
  error?: string;
  options: Option[];
  required?: boolean;
  value: SelectedOption[] | null;
  onChange: (value: SelectedOption[]) => void;
  onExpand: (exp: ExpandedOption) => void;
  expanded: ExpandedOption | null;
}) => {
  return (
    <FormControl
      fullWidth
      sx={theme => ({
        width: '320px',
        [theme.breakpoints.only('xs')]: { width: '100%' },
      })}
    >
      <InputLabel required={required}>{label}</InputLabel>
      <Select
        sx={theme => ({
          [theme.breakpoints.only('xs')]: {
            '& .MuiOutlinedInput-input': { whiteSpace: 'normal' },
          },
        })}
        label={label}
        variant="outlined"
        multiple
        value={value || []}
        renderValue={v =>
          options.flatMap(o => renderValue(o, v?.find(y => y.value === o.value) || null)).join(', ')
        }
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: '300px',
            },
          },
        }}
      >
        <Box sx={{ p: '5px 15px' }}>
          <Box sx={{ ml: '-3px' }}>
            <Button
              size="small"
              onClick={() => {
                onChange(selectAll(options));
              }}
            >
              Select all
            </Button>
            <Button size="small" onClick={() => onChange([])}>
              Clear all
            </Button>
          </Box>
          {options.map((x, idx) => (
            <OptionComponent
              key={idx}
              option={x}
              onChange={onChange}
              onExpand={onExpand}
              expanded={expanded}
              value={value}
              level={0}
            />
          ))}
        </Box>
      </Select>
      {error ? (
        <FormHelperText sx={{ m: 0, mt: '5px' }} error={true}>
          {error}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
};

const InlineMultiSelect = ({
  label,
  error,
  options,
  required,
  value,
  onChange,
  onExpand,
  expanded,
}: {
  label: string;
  error?: string;
  options: Option[];
  required?: boolean;
  value: SelectedOption[] | null;
  onChange: (value: SelectedOption[]) => void;
  onExpand: (exp: ExpandedOption) => void;
  expanded: ExpandedOption | null;
}) => {
  return (
    <FormControl
      fullWidth
      sx={theme => ({
        width: '320px',
        [theme.breakpoints.only('xs')]: { width: '100%' },
      })}
    >
      <FormLabel sx={{ mb: '5px' }} required={required}>
        {label}
      </FormLabel>
      <FormGroup>
        {options.map((x, idx) => (
          <OptionComponent
            key={idx}
            option={x}
            onChange={onChange}
            onExpand={onExpand}
            expanded={expanded}
            value={value}
            level={0}
          />
        ))}
      </FormGroup>
      {error ? (
        <FormHelperText sx={{ m: 0 }} error={true}>
          {error}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
};

export type ExpandedOption = {
  expanded?: boolean;
  subOptions?: Record<string, ExpandedOption>;
};

export const OptionComponent: React.FC<{
  option: Option;
  onChange: (v: SelectedOption[]) => void;
  onExpand: (exp: ExpandedOption) => void;
  expanded: ExpandedOption | null;
  value: SelectedOption[] | null;
  level: number;
  disableRipple?: boolean;
}> = ({ option, onChange, onExpand, expanded, value, level, disableRipple }) => {
  const selected = value?.find(x => x.value === option.value);
  let checked = false;
  let indeterminate = false;
  if (selected && selected.subOptions && option.subOptions) {
    checked = selected.subOptions.length === option.subOptions.length;
    indeterminate = !checked;
  } else if (selected) {
    checked = true;
  }

  const checkbox = (
    <FormControlLabel
      label={option.name}
      sx={{
        ...(level > 0 ? { ml: `${level * 20 + 0}px` } : {}),
        '.MuiFormControlLabel-label': { fontSize: level !== 0 ? '15px' : '16px' },
      }}
      control={
        <Checkbox
          disableRipple={disableRipple}
          checked={!!checked}
          indeterminate={indeterminate}
          onChange={() => {
            if (!checked) {
              onChange(
                (value || [])
                  .filter(x => x.value !== option.value)
                  .concat({
                    subOptions: option.subOptions && selectAll(option.subOptions),
                    value: option.value,
                  })
              );
            } else onChange((value || []).filter(x => x.value !== option.value));
          }}
        />
      }
    />
  );

  const subCheckboxes = option.subOptions?.map((x, idx) => {
    const subExpanded = expanded?.subOptions?.[x.value];
    return (
      <OptionComponent
        key={idx}
        option={x}
        disableRipple={disableRipple}
        onChange={y => {
          if (y.length === 0) {
            onChange((value || []).filter(x_ => x_.value !== option.value));
          } else {
            onChange(
              (value || [])
                .filter(x_ => x_.value !== option.value)
                .concat({
                  subOptions: y,
                  value: option.value,
                })
            );
          }
        }}
        onExpand={exp => {
          onExpand({
            ...expanded,
            subOptions: { ...expanded?.subOptions, [x.value]: exp },
          });
        }}
        expanded={subExpanded !== undefined ? subExpanded : null}
        value={selected?.subOptions || null}
        level={level + 1}
      />
    );
  });

  if (subCheckboxes) {
    return (
      <Accordion
        disableGutters
        elevation={0}
        expanded={expanded?.expanded !== undefined ? expanded.expanded : indeterminate}
        sx={{ '&.MuiAccordion-root:before': { display: 'none' } }}
      >
        <AccordionSummary
          sx={{
            p: 0,
            justifyContent: 'start',
            '&.MuiAccordionSummary-root': {
              height: '42px',
              minHeight: 'initial',
            },
            '& .MuiAccordionSummary-content': {
              flexGrow: 0,
              m: 0,
            },
          }}
          expandIcon={
            <IconButton
              onClick={() => {
                onExpand({
                  ...expanded,
                  expanded:
                    expanded?.expanded !== undefined
                      ? !expanded.expanded
                      : indeterminate
                      ? false
                      : true,
                });
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          }
        >
          {checkbox}
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {subCheckboxes}
        </AccordionDetails>
      </Accordion>
    );
  }
  return <Box>{checkbox}</Box>;
};

const selectAll: (opts: Option[]) => SelectedOption[] = opts =>
  opts.map(x => ({ value: x.value, subOptions: x.subOptions && selectAll(x.subOptions) }));

const renderValue: (x: Option, s: SelectedOption | null) => string[] = (x, s) => {
  if (!s) return [];
  if (x.subOptions && s.subOptions) {
    if (s.subOptions.length === x.subOptions.length) return [x.name];
    return x.subOptions.flatMap(x_ =>
      renderValue(x_, s.subOptions!.find(s_ => s_.value === x_.value) || null)
    );
  }
  return [x.name];
};
