import EditIcon from '@mui/icons-material/Edit';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  menuItemClasses,
  Theme,
  Typography,
} from '@mui/material';
import { SxProps, useTheme } from '@mui/system';
import { Either } from 'fp-ts/lib/Either';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RecordPartial } from '../record/recordBlockTypes';
import { RecordNestedInputBlock } from '../record/recordInputBlock';
import ReactEditRecordInputBlock from './edit/reactEditRecordInputBlock';
import ReactViewRecordInput from './view/reactViewRecordInputBlock';

export const ReactRecordInput =
  <R, S extends any[], V>(
    title: string,
    opts?: { editLabel?: string; onEdit?: () => void; editable?: boolean }
  ) =>
  (block: RecordNestedInputBlock<R, S, V>) => {
    const View = ReactViewRecordInput(block);
    const Edit = ReactEditRecordInputBlock(block);

    return function ReactForm(
      props: {
        value: RecordPartial<S>;
        onSubmit?: (v: V, editedData: Partial<V>) => Promise<Either<string, any>>;
        inlineSubmit?: boolean;
        editChildren?: React.ReactNode;
        formMode?: 'edit' | 'view';
        onChangeMode?: (mode: 'edit' | 'view') => void;
        sx?: SxProps<Theme>;
        menuItems?: { label: string; onClick: () => void | Promise<any> }[];
      } & R
    ) {
      const router = useRouter();
      const routerMode =
        typeof router.query['mode'] === 'string' && ['view', 'edit'].includes(router.query['mode'])
          ? (router.query['mode'] as 'view' | 'edit')
          : undefined;

      const [state, setState] = useState<{
        mounted: boolean;
        mode?: 'edit' | 'view';
        menuItemsLoading: Record<number, boolean>;
      }>({
        mounted: false,
        mode: props.formMode || routerMode || 'view',
        menuItemsLoading: {},
      });

      const onChangeMode = props.onChangeMode;
      useEffect(() => {
        onChangeMode && state.mode && onChangeMode(state.mode);
      }, [onChangeMode, state.mode]);

      const [anchorEl, setAnchorEl] = useState(null);
      const open = Boolean(anchorEl);
      const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
      };
      const handleClose = () => {
        setAnchorEl(null);
      };

      const theme = useTheme();

      const menu = props.menuItems && props.menuItems.length > 0 && (
        <>
          <IconButton
            aria-controls={open ? 'menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            sx={{ color: theme.palette.primary.main }}
          >
            <MoreHoriz />
          </IconButton>
          <Menu
            id="menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            {props.menuItems.map((m, idx) => (
              <MenuItem
                sx={{ minWidth: '200px' }}
                key={idx}
                disabled={state.menuItemsLoading[idx] === true}
                onClick={() => {
                  const res = m.onClick();
                  if (typeof res === 'object' && 'finally' in res) {
                    setState(s => ({
                      ...s,
                      menuItemsLoading: { ...s.menuItemsLoading, [idx]: true },
                    }));
                    res.finally(() => {
                      setState(s => ({
                        ...s,
                        menuItemsLoading: { ...s.menuItemsLoading, [idx]: false },
                      }));
                      handleClose();
                    });
                  } else {
                    handleClose();
                  }
                }}
              >
                {m.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      );

      if (state.mode === 'edit') {
        return (
          <Box sx={{ ...props.sx }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: '20px' }}>
              <Typography fontSize={'22px'}>{title}</Typography>
              <Button
                sx={{ mt: '3px', ml: '15px', mr: '8px' }}
                variant="text"
                onClick={() => setState(s => ({ ...s, mode: 'view' }))}
              >
                <Typography>View</Typography>
                <VisibilityIcon sx={{ width: '14px', ml: '5px' }} />
              </Button>
              {menu}
            </Box>
            <Edit {...props} onSubmit={(a, b) => props.onSubmit && props.onSubmit(a, b)} />
            {props.editChildren ? <Box sx={{ mt: '40px' }}>{props.editChildren}</Box> : <></>}
          </Box>
        );
      }

      if (state.mode === 'view')
        return (
          <Box sx={{ ...props.sx }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: '12px' }}>
              <Typography fontSize={'22px'}>{title}</Typography>
              {opts?.editable !== false && (
                <Button
                  sx={{ mt: '3px', ml: '15px', mr: '8px' }}
                  variant="text"
                  onClick={() => {
                    if (opts?.onEdit) {
                      return opts.onEdit();
                    } else {
                      return setState(s => ({ ...s, mode: 'edit' }));
                    }
                  }}
                >
                  <Typography>{opts?.editLabel || 'Edit'}</Typography>
                  <EditIcon sx={{ width: '14px', ml: '5px' }} />
                </Button>
              )}
              {menu}
            </Box>
            <View {...props} />
          </Box>
        );

      return <></>;
    };
  };

export default ReactRecordInput;
