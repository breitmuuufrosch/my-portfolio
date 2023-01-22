import * as React from 'react';
import { TextField } from '@mui/material';
import { camelize } from '../data/formatting';

export function InputDecimal(props: {
  label: string,
  variant?: 'standard' | 'filled' | 'outlined',
  value: number,
  onChange?: (value: number) => void,
  readonly?: boolean,
}) {
  const { value, onChange } = props;
  const readonly = props.readonly ?? false;

  const [myInput, setMyInput] = React.useState<string>('');

  React.useEffect(() => {
    setMyInput(value.toFixed(4));
  }, [value]);

  const change = (e) => {
    console.log(e);
    const start = e.target.selectionStart;
    let val = e.target.value;
    val = val.replace(/([^0-9.]+)/, '');
    val = val.replace(/^(0|\.)/, '=');
    const match = /(\d{0,14})[^.]*((?:\.\d{0,4})?)/g.exec(val);
    const newValue = match[1] + match[2];
    e.target.value = newValue;
    // this.setState({ input: value });
    if (val.length > 0) {
      e.target.value = Number(newValue).toFixed(4);
      e.target.setSelectionRange(start, start);
      onChange(Number(newValue));
      setMyInput(Number(newValue).toFixed(4));
    }
  };

  return (
    <TextField
      id={camelize(props.label)}
      type="text"
      label={props.label}
      variant={props.variant}
      onChange={change}
      value={myInput}
      sx={{ input: { textAlign: 'right' } }}
      InputProps={{
        readOnly: readonly,
      }}
      fullWidth
    />
  );
}

InputDecimal.defaultProps = {
  variant: 'outlined',
  onChange: () => { },
  readonly: false,
};
