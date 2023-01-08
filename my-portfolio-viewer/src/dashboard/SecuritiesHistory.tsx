import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import {
  Box,
  Button,
  MenuItem,
  Modal,
  Typography,
  TextField,
} from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// import { makeStyles } from '@mui/styles';
// import Dayjs from '@date-io/dayjs';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSearchParams } from 'react-router-dom';
import { Security, SecurityHistory } from '@backend/types/security';
import { Currency } from '@backend/types/currency';
import { Account } from '@backend/types/account';
import { Title } from './Title';
import {
  getAccounts,
  getCurrencies,
  getSecurities,
  getSecurityHistoryById,
  getSecurityTransactionDetailsS,
} from '../types/service';
import { rounding } from '../data/formatting';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

interface SecurityHistoryCum extends SecurityHistory {
  amountCum: number,
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// const useStyles = makeStyles({
//   input: {
//     '& input[type=number]': {
//       '-moz-appearance': 'textfield',
//     },
//     '& input[type=number]::-webkit-outer-spin-button': {
//       '-webkit-appearance': 'none',
//       margin: 0,
//     },
//     '& input[type=number]::-webkit-inner-spin-button': {
//       '-webkit-appearance': 'none',
//       margin: 0,
//     },
//   },
// });

export function InputDecimal(props: {
  id: string,
  label: string,
  variant: 'standard' | 'filled' | 'outlined',
  value: number,
  onChange: (value: number) => void,
}) {
  // constructor(prop) {
  //   super(prop);
  //   this.state = { start: 0, input: "" };
  //   // this.start = 0;
  // }
  const { value, onChange } = props;

  const [myInput, setMyInput] = React.useState<string>();

  React.useEffect(() => {
    setMyInput(value.toFixed(4));
  }, [value]);

  const change = (e) => {
    const start = e.target.selectionStart;
    let val = e.target.value;
    val = val.replace(/([^0-9.]+)/, '');
    val = val.replace(/^(0|\.)/, '=');
    const match = /(\d{0,7})[^.]*((?:\.\d{0,4})?)/g.exec(val);
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
      id={props.id}
      type="text"
      label={props.label}
      variant={props.variant}
      onChange={change}
      value={myInput}
      style={{ width: '200px', margin: '5px' }}
    // {...this.props}
    />
  );
}

export function SecurityTransactionModal(props: {
  open: boolean,
  transactionId: number,
  handleClose: () => void,
}) {
  const { open, transactionId, handleClose } = props;

  const [transaction, setTransaction] = React.useState<SecurityHistory>(null);
  const [currencies, setCurrencies] = React.useState<Currency[]>(null);
  const [securities, setSecurities] = React.useState<Security[]>(null);
  const [accounts, setAccounts] = React.useState<Account[]>(null);
  // const [value, setValue] = React.useState<Dayjs | null>(null);

  React.useEffect(() => {
    getCurrencies().then(setCurrencies);
    getSecurities().then(setSecurities);
    getAccounts().then(setAccounts);
  }, []);

  React.useEffect(() => {
    if (transactionId === 0) {
      return;
    }
    console.log(transactionId);
    getSecurityHistoryById(transactionId)
      .then(setTransaction);

    console.log(transaction);
  }, [transactionId]);

  if (transaction === null) {
    return (<p>Not yet available</p>);
  }
  // const classes = useStyles();
  // console.log(classes);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Text in a modal
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
        </Typography>
        <form>
          <TextField
            id="name"
            style={{ width: '200px', margin: '5px' }}
            type="text"
            label="Symbol"
            variant="outlined"
          />
          <TextField
            id="currency"
            select
            label=" Currency"
            value={transaction.currency}
          // onChange={handleChange}
          >
            {currencies?.map((option) => (
              <MenuItem key={option.symbol} value={option.symbol}>
                {option.description}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            id="symbol"
            select
            label=" Security"
            value={transaction.symbol}
          // onChange={handleChange}
          >
            {securities?.map((option) => (
              <MenuItem key={option.symbol} value={option.symbol}>
                {option.nameShort}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            id="accountId"
            select
            label=" Account"
            value={transaction.accountId}
          // onChange={handleChange}
          >
            {accounts?.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {`${option.name} (${option.currency})`}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            id="dates"
            style={{ width: '200px', margin: '5px' }}
            type="text"
            label="Date"
            variant="outlined"
          />
          <InputDecimal
            id="price"
            label="Price"
            variant="outlined"
            value={transaction.price}
            onChange={(value: number) => { setTransaction({ ...transaction, price: value }); }}
          />
          <InputDecimal
            id="amount"
            label="Amount"
            variant="outlined"
            value={transaction.amount}
            onChange={(value: number) => { setTransaction({ ...transaction, amount: value }); }}
          />
          <InputDecimal
            id="value"
            label="Value"
            variant="outlined"
            value={transaction.value}
            onChange={(value: number) => { setTransaction({ ...transaction, value }); }}
          />
          <InputDecimal
            id="fee"
            label="Fee"
            variant="outlined"
            value={transaction.fee}
            onChange={(value: number) => { setTransaction({ ...transaction, fee: value }); }}
          />
          <InputDecimal
            id="tax"
            label="Tax"
            variant="outlined"
            value={transaction.tax}
            onChange={(value: number) => { setTransaction({ ...transaction, tax: value }); }}
          />
          {/* "symbol": "ABBN.SW",
            "date": "2022-09-19",
            "type": "buy" */}
        </form>
      </Box>
    </Modal>
  );
}

export function SecurityHistoryView() {
  const [searchParams] = useSearchParams();
  const [securityHistory, setSecurityHistory] = React.useState<SecurityHistoryCum[] | null>(null);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [selectedTransactionId, setSelectedTransactionId] = React.useState<number>(0);

  React.useEffect(() => {
    getSecurityTransactionDetailsS(Number(searchParams.get('securityId')))
      .then(
        (result) => {
          let amountCum = 0;
          setSecurityHistory(
            result
              .map((item) => {
                amountCum += item.type === 'dividend' ? 0 : Number(item.amount);
                return {
                  ...item,
                  date: new Date(item.date),
                  amountCum,
                };
              }),
          );
        },
      );
  }, []);

  return (
    <>
      <Title>Securities</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Event</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Value</TableCell>
            <TableCell align="right">Fee</TableCell>
            <TableCell align="right">Tax</TableCell>
            <TableCell align="right">Ammount</TableCell>
            <TableCell align="right">Saldo</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {securityHistory?.map((row) => (
            <TableRow key={`${row.id}-${row.type}`}>
              <TableCell>{row.date.toLocaleDateString('de-CH')}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell align="right">{rounding(row.total)}</TableCell>
              <TableCell align="right">{rounding(row.value)}</TableCell>
              <TableCell align="right">{rounding(row.fee)}</TableCell>
              <TableCell align="right">{rounding(row.tax)}</TableCell>
              <TableCell align="right">{rounding(row.amount, 4)}</TableCell>
              <TableCell align="right">{rounding(row.amountCum, 4)}</TableCell>
              <TableCell>
                <Button color="primary" href="#" onClick={() => { handleOpen(); setSelectedTransactionId(row.id); }}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        See more orders
      </Link>
      <SecurityTransactionModal open={open} transactionId={selectedTransactionId} handleClose={handleClose} />
    </>
  );
}
