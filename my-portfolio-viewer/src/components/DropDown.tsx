import * as React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { camelize } from '../data/formatting';

export function DropDown<T>(props: {
  label: string,
  value: any,
  onChange?: (value: any) => void,
  items: T[],
  itemKey: (item: T) => string,
  itemDisplay: (item: T) => string,
}) {
  return (
    <TextField
      id={camelize(props.label)}
      select
      label={props.label}
      value={props.value}
      fullWidth
      onChange={props.onChange}
    >
      {props.items?.map((option) => (
        <MenuItem key={props.itemKey(option)} value={props.itemKey(option)}>
          {props.itemDisplay(option)}
        </MenuItem>
      ))}
    </TextField>
  );
}

DropDown.defaultProps = {
  onChange: () => { },
};
