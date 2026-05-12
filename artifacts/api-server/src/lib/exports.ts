import type { Response } from "express";
import * as XLSX from "xlsx";

export type Cell = string | number | boolean | Date | null | undefined;
export interface ExportColumn<T> {
  key: string;
  header: string;
  get: (row: T) => Cell;
}

function cellToString(v: Cell): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") return v;
  return String(v);
}

function csvEscape(s: string): string {
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function rowsToCsv<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const header = columns.map((c) => csvEscape(c.header)).join(",");
  const lines = rows.map((r) =>
    columns.map((c) => csvEscape(cellToString(c.get(r)))).join(","),
  );
  return [header, ...lines].join("\n");
}

export function rowsToXlsxBuffer<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  sheetName = "Sheet1",
): Buffer {
  const data: Cell[][] = [columns.map((c) => c.header)];
  for (const r of rows) {
    data.push(columns.map((c) => c.get(r) ?? ""));
  }
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function sendExport<T>(
  res: Response,
  format: string | undefined,
  rows: T[],
  columns: ExportColumn<T>[],
  filenameStem: string,
): boolean {
  const ts = Date.now();
  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filenameStem}-${ts}.csv"`,
    );
    res.send(rowsToCsv(rows, columns));
    return true;
  }
  if (format === "xlsx") {
    const buf = rowsToXlsxBuffer(rows, columns, filenameStem);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filenameStem}-${ts}.xlsx"`,
    );
    res.send(buf);
    return true;
  }
  return false;
}
