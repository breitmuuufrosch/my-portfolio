import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
  SxProps,
  TableContainer,
  TableFooter,
  Theme,
} from '@mui/material';

export type RowAction<T> = (item: T) => any;

export interface CustomColumn<T> {
  id: string,
  label: string,
  minWidth?: number,
  align?: 'left' | 'right' | 'center',
  format?: (value: number | Date | string) => string,
  sxHeader?: SxProps<Theme>,
  sxBody?: SxProps<Theme>,
  style?: (trade: T) => React.CSSProperties,
  components?: RowAction<T>[],
}

export function CustomTable<T>(props: {
  maxHeight?: number,
  columns: CustomColumn<T>[],
  data: T[],
  footerColumns?: string[],
  footerData?: T[],
  dataKey: string,
  activeKey: string,
  setActive: (item: T) => void,
}) {
  const {
    maxHeight,
    activeKey,
    columns,
    data,
    footerColumns,
    footerData,
    dataKey,
    setActive,
  } = props;

  // console.log(data);
  if (data == null) {
    return (null);
  }

  return (
    <TableContainer sx={{ maxHeight }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {
              columns.map((column) => (
                <TableCell key={column.id} align={column.align} sx={column.sxHeader}>{column.label}</TableCell>
              ))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              hover
              key={row[dataKey]}
              onClick={() => setActive(row)}
              sx={{ backgroundColor: activeKey === row[dataKey] ? 'background.paper' : 'none' }}
            >
              {
                columns.map((column) => {
                  let value = row[column.id];
                  value = column.format ? column.format(value) : value;
                  return (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sx={column.sxBody}
                      style={column.style ? column.style(row) : {}}
                    >
                      {
                        column.components
                          ? column.components.map((component) => component(row))
                          : value
                      }
                    </TableCell>
                  );
                })
              }
            </TableRow>
          ))}
        </TableBody>
        {
          footerData && (
            <TableFooter>
              {footerData.map((row) => (
                <TableRow
                  hover
                  key={row[dataKey]}
                  onClick={() => setActive(row[dataKey])}
                  sx={{ backgroundColor: activeKey === row[dataKey] ? 'background.paper' : 'none' }}
                >
                  {
                    columns.map((column) => {
                      // console.log(footerColumns, column.id, footerColumns.includes(column.id));
                      if (!footerColumns.includes(column.id)) {
                        return (<TableCell />);
                      }
                      let value = row[column.id];
                      value = column.format ? column.format(value) : value;
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={column.sxBody}
                          style={column.style ? column.style(row) : {}}
                        >
                          {
                            column.components
                              ? column.components.map((component) => component(row))
                              : value
                          }
                        </TableCell>
                      );
                    })
                  }
                </TableRow>
              ))}
            </TableFooter>
          )
        }
        {/* <TableFooter>
            {
              ['CHF', 'EUR', 'USD'].map((currency) => (
                <TableRow key={currency}>
                  <TableCell>{currency}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    {
                      trades && formatNumber(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + row.entryPrice, 0))
                    }
                  </TableCell>
                  <TableCell>
                    {
                      trades && formatNumber(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + row.entryPriceAll, 0))
                    }
                  </TableCell>
                  <TableCell>
                    {
                      trades && formatNumber(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + row.exitPrice, 0))
                    }
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    {
                      trades && formatNumber(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + row.exitPrice - row.entryPriceAll, 0))
                    }
                  </TableCell>
                  <TableCell>
                    {
                      trades && formatNumber(
                        100 * (
                          trades.filter((row) => row.currency === currency)
                            .reduce((accumulator, row) => accumulator + row.exitPrice - row.entryPriceAll, 0)
                          / trades.filter((row) => row.currency === currency)
                            .reduce((accumulator, row) => accumulator + row.entryPriceAll, 0)
                        ),
                      )
                    }
                  </TableCell>
                </TableRow>
              ))
            }
          </TableFooter> */}
      </Table>
    </TableContainer>
  );
}

CustomTable.defaultProps = {
  maxHeight: window.innerHeight - 64 - 52 - 32 - 32 - 16 - 16,
  footerColumns: [],
  footerData: [],
};
