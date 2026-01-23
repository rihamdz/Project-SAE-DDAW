import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";

export type Column<T> = {
  key: string;
  header: string;
  width?: number | string;
  render: (row: T) => React.ReactNode;
};


export default function DataTable<T>({
  columns,
  rows,
}: {
  columns: Column<T>[];
  rows: T[];
}) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((c) => (
              <TableCell key={c.key} sx={{ width: c.width, fontWeight: 800 }}>
                {c.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow key={idx} hover>
              {columns.map((c) => (
                <TableCell key={c.key}>{c.render(r)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
