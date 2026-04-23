import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';

interface Row { id: number; name: string; status: string }

const data: Row[] = [
  { id: 1, name: 'Item A', status: 'active' },
  { id: 2, name: 'Item B', status: 'inactive' },
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
];

export default function DataTable() {
  const [filter, setFilter] = useState('');
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter..." className="border p-2 mb-4" />
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>{hg.headers.map((h) => <th key={h.id} className="border p-2 text-left">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id} className="border p-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
