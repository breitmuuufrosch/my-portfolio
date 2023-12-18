import * as React from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { Account, AccountTransaction } from '@backend/types/account';
import { Security, SecurityTransactionSummary } from '@backend/types/security';
import {
  getAccountTransactionById,
  getAccounts,
  getSecurities,
  getSecurityHistoryById,
  updateSecurityHistoryById,
} from '../types/service';
import { DropDown } from '../components/DropDown';
import { InputDecimal } from '../components/InputDecimal';
// import { makeStyles } from '@mui/styles';
// import Dayjs from '@date-io/dayjs';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const styleTitle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  p: 2,
};
const styleDialog = {
  bgcolor: 'background.paper',
  // border: '2px solid #000',
  // boxShadow: 24,
  // p: 4,
};

const styleCurrency = { display: 'flex', alignItems: 'center' };
const styleSpacerXs = { display: { xs: 'flex', md: 'none' }, alignItems: 'center' };
const styleSpacerLg = { display: { xs: 'none', md: 'flex' }, alignItems: 'center' };

export const transactionTotal = (transaction: SecurityTransactionSummary) => {
  if (['buy', 'posting'].includes(transaction.type)) {
    return transaction.value + transaction.fee + transaction.tax;
  }

  return transaction.value - transaction.fee - transaction.tax;
};

function BootstrapDialogTitle(props: {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.defaultProps = {
  children: undefined,
};

export function SecurityTransactionDialog(props: {
  open: boolean,
  transactionId: number,
  handleClose: () => void,
}) {
  const { open, transactionId, handleClose } = props;

  const [transaction, setTransaction] = React.useState<SecurityTransactionSummary>(null);
  const [accountTransaction, setAccountTransaction] = React.useState<AccountTransaction>(null);
  const [securities, setSecurities] = React.useState<Security[]>(null);
  const [accounts, setAccounts] = React.useState<Account[]>(null);

  const updateTransaction = (update: { [key: string]: string | number }): void => {
    setTransaction({ ...transaction, ...update });
  };
  const updateAccountTransaction = (update: { [key: string]: string | number }): void => {
    setAccountTransaction({ ...accountTransaction, ...update });
  };

  const saveTransaction = (): void => {
    console.info(transaction);
    updateSecurityHistoryById({ ...transaction, date: new Date(transaction.date) });
  };

  React.useEffect(() => {
    // getCurrencies().then(setCurrencies);
    getSecurities().then(setSecurities);
    getAccounts().then(setAccounts);
  }, []);

  React.useEffect(() => {
    if (transactionId === 0) {
      return;
    }

    getSecurityHistoryById(transactionId)
      .then((newTransaction: SecurityTransactionSummary) => {
        setTransaction(newTransaction);

        if (newTransaction.accountTransactionId !== null) {
          getAccountTransactionById(newTransaction.accountTransactionId)
            .then(setAccountTransaction);
        }
      });
  }, [transactionId]);

  if (transaction == null) {
    return (null);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      aria-describedby="modal-modal-description"
      PaperProps={{
        sx: {
          m: 1,
          maxWidth: 1024,
        },
      }}
    >
      <Box sx={styleDialog}>
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          {transaction.type}
        </BootstrapDialogTitle>
        <DialogContent>
          <Typography id="modal-modal-description" sx={{ mb: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DropDown
                  label="Security"
                  value={transaction.symbol}
                  items={securities}
                  itemKey={(item) => item.symbol}
                  itemDisplay={(item) => item.nameShort}
                  onChange={(e) => { updateTransaction({ symbol: e.target.value }); }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DropDown
                  label="AccountId"
                  value={transaction.accountId}
                  items={accounts}
                  itemKey={(item) => String(item.id)}
                  itemDisplay={(item) => `${item.name} (${item.currency})`}
                  onChange={(e) => { updateTransaction({ accountId: e.target.value }); }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MobileDatePicker
                    label="Date"
                    inputFormat="DD.MM.YYYY"
                    value={transaction.date}
                    onChange={(newValue) => { setTransaction({ ...transaction, date: newValue }); }}
                    renderInput={(params) => <TextField fullWidth {...params} />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid container item spacing={2}>
                <Grid item xs={12} md={3}>
                  <InputDecimal
                    label="Amount"
                    value={transaction.amount}
                    onChange={
                      (newValue: number) => {
                        setTransaction({ ...transaction, amount: newValue, value: transaction.price * newValue });
                      }
                    }
                  />
                </Grid>
                <Grid item xs={12} md={1} sx={styleSpacerLg}>X</Grid>
                <Grid item xs={10} md={3}>
                  <InputDecimal
                    label="Price"
                    value={transaction.price}
                    onChange={
                      (newValue: number) => {
                        setTransaction({ ...transaction, price: newValue, value: transaction.amount * newValue });
                      }
                    }
                  />
                </Grid>
                <Grid item xs={2} md={1} sx={styleSpacerLg}>{`${transaction.currency} = `}</Grid>
                <Grid item xs={2} md={1} sx={styleSpacerXs}>{transaction.currency}</Grid>
                <Grid item xs={10} md={3}>
                  <InputDecimal
                    label="Value"
                    value={transaction.value}
                    onChange={(newValue: number) => { setTransaction({ ...transaction, value: newValue }); }}
                  />
                </Grid>
                <Grid item xs={2} md={1} style={styleCurrency}>{transaction.currency}</Grid>
              </Grid>
              <Grid container item spacing={2}>
                <Grid item md={8} sx={styleSpacerLg} />
                <Grid item xs={10} md={3}>
                  <InputDecimal
                    label="Fee"
                    value={transaction.fee}
                    onChange={(value: number) => { setTransaction({ ...transaction, fee: value }); }}
                  />
                </Grid>
                <Grid item xs={2} md={1} style={styleCurrency}>{transaction.currency}</Grid>
              </Grid>
              <Grid container item spacing={2}>
                <Grid item xs={8} sx={styleSpacerLg} />
                <Grid item xs={10} md={3}>
                  <InputDecimal
                    label="Tax"
                    value={transaction.tax}
                    onChange={(value: number) => { setTransaction({ ...transaction, tax: value }); }}
                  />
                </Grid>
                <Grid item xs={2} md={1} style={styleCurrency}>{transaction.currency}</Grid>
              </Grid>
              <Grid container item spacing={2}>
                <Grid item xs={8} sx={styleSpacerLg} />
                <Grid item xs={10} md={3}>
                  <InputDecimal
                    label="Total"
                    value={transactionTotal(transaction)}
                    readonly
                  />
                </Grid>
                <Grid item xs={2} md={1} sx={styleCurrency}>{transaction.currency}</Grid>
              </Grid>
              {
                accountTransaction && (
                  <>
                    <Box sx={styleTitle}>
                      <Typography id="modal-modal-title" variant="h6" component="h2">
                        {transaction.type}
                      </Typography>
                    </Box>
                    <Grid container item spacing={2} justifyContent="center" flexDirection="row">
                      <Grid container item xs={12} md={4} spacing={2} flexDirection="column">
                        <Grid container item spacing={2}>
                          <Grid item xs={12}>
                            <DropDown
                              label="AccountId (from)"
                              value={accountTransaction.fromAccountId}
                              items={accounts}
                              itemKey={(item) => String(item.id)}
                              itemDisplay={(item) => `${item.name} (${item.currency})`}
                              onChange={(e) => {
                                const fromAccountId = Number(e.target.value);
                                updateAccountTransaction({
                                  from_account_id: fromAccountId,
                                  from_currency: accounts.find((a) => a.id === fromAccountId).currency,
                                });
                              }}
                            />
                          </Grid>
                          <Grid item xs={10} md={9}>
                            <InputDecimal
                              label="Value (from)"
                              value={accountTransaction.fromValue}
                              onChange={(value: number) => { updateAccountTransaction({ from_value: value }); }}
                            />
                          </Grid>
                          <Grid item xs={2} md={3} style={styleCurrency}>{accountTransaction.fromCurrency}</Grid>
                        </Grid>
                        <Grid container item spacing={2}>
                          <Grid item xs={10} md={9}>
                            <InputDecimal
                              label="Fee (from)"
                              value={accountTransaction.fromFee}
                              onChange={(value: number) => { updateAccountTransaction({ from_fee: value }); }}
                            />
                          </Grid>
                          <Grid item xs={2} md={3} style={styleCurrency}>{accountTransaction.fromCurrency}</Grid>
                        </Grid>
                        <Grid container item spacing={2}>
                          <Grid item xs={10} md={9}>
                            <InputDecimal
                              label="Tax (from)"
                              value={accountTransaction.fromTax}
                              onChange={(value: number) => { updateAccountTransaction({ from_tax: value }); }}
                            />
                          </Grid>
                          <Grid item xs={2} md={3} style={styleCurrency}>{accountTransaction.fromCurrency}</Grid>
                        </Grid>
                      </Grid>
                      <Grid container item xs={12} md={4} spacing={2} flexDirection="column">
                        <Grid container item spacing={2}>
                          <Grid item xs={12}>
                            <DropDown
                              label="AccountId (to)"
                              value={accountTransaction.toAccountId}
                              items={accounts}
                              itemKey={(item) => String(item.id)}
                              itemDisplay={(item) => `${item.name} (${item.currency})`}
                              onChange={(e) => {
                                const toAccountId = Number(e.target.value);
                                updateAccountTransaction({
                                  to_account_id: toAccountId,
                                  to_currency: accounts.find((a) => a.id === toAccountId).currency,
                                });
                              }}
                            />
                          </Grid>
                          <Grid item xs={10} md={9}>
                            <InputDecimal
                              label="Value (to)"
                              value={accountTransaction.toValue}
                              onChange={(value: number) => { updateAccountTransaction({ to_value: value }); }}
                            />
                          </Grid>
                          <Grid item xs={2} md={3} style={styleCurrency}>{accountTransaction.toCurrency}</Grid>
                        </Grid>
                        <Grid container item spacing={2}>
                          <Grid item xs={10} md={9}>
                            <InputDecimal
                              label="Fee (to)"
                              value={accountTransaction.toFee}
                              onChange={(value: number) => { updateAccountTransaction({ to_fee: value }); }}
                            />
                          </Grid>
                          <Grid item xs={2} md={3} style={styleCurrency}>{accountTransaction.toCurrency}</Grid>
                        </Grid>
                        <Grid container item spacing={2}>
                          <Grid item xs={10} md={9}>
                            <InputDecimal
                              label="Tax (to)"
                              value={accountTransaction.toTax}
                              onChange={(value: number) => { updateAccountTransaction({ to_tax: value }); }}
                            />
                          </Grid>
                          <Grid item xs={2} md={3} style={styleCurrency}>{accountTransaction.toCurrency}</Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={4} sx={styleSpacerLg} />
                    </Grid>
                  </>
                )
              }
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Grid container item spacing={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Grid item xs={6} md={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={saveTransaction}
                fullWidth
              >
                Save
              </Button>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button variant="outlined" color="primary" startIcon={<CancelIcon />} fullWidth>Cancel</Button>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button variant="outlined" color="primary" startIcon={<DeleteIcon />} fullWidth>Delete</Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
