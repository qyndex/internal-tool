import { useEffect, useState, useCallback, useMemo } from 'react';
import type { FormEvent } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';
import type { Record as DbRecord, RecordInsert } from '../types/database';

const STATUSES = ['active', 'pending', 'completed'] as const;
const CATEGORIES = ['engineering', 'finance', 'hr', 'marketing', 'operations', 'product'] as const;
const PAGE_SIZE = 10;

interface EditingRecord {
  id: string;
  title: string;
  status: string;
  category: string;
  value: string;
}

export default function DataTable() {
  const { user } = useAuth();
  const [records, setRecords] = useState<DbRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<RecordInsert>({
    title: '',
    status: 'active',
    category: '',
    value: null,
  });

  // Edit modal state
  const [editing, setEditing] = useState<EditingRecord | null>(null);

  // Delete confirmation state
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('records')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      // Apply sorting
      if (sorting.length > 0) {
        const sort = sorting[0];
        query = query.order(sort.id, { ascending: !sort.desc });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error: fetchErr, count } = await query;

      if (fetchErr) throw fetchErr;
      setRecords(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, sorting]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, statusFilter]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const { error: insertErr } = await supabase
        .from('records')
        .insert({
          title: createForm.title,
          status: createForm.status ?? 'active',
          category: createForm.category || null,
          value: createForm.value,
          created_by: user?.id ?? null,
        });

      if (insertErr) throw insertErr;

      // Log the creation
      await supabase.from('activity_log').insert({
        user_id: user?.id ?? null,
        action: `Created record: ${createForm.title}`,
      });

      setShowCreate(false);
      setCreateForm({ title: '', status: 'active', category: '', value: null });
      fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create record');
    }
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError(null);

    try {
      const { error: updateErr } = await supabase
        .from('records')
        .update({
          title: editing.title,
          status: editing.status,
          category: editing.category || null,
          value: editing.value ? parseFloat(editing.value) : null,
        })
        .eq('id', editing.id);

      if (updateErr) throw updateErr;

      await supabase.from('activity_log').insert({
        user_id: user?.id ?? null,
        action: `Updated record: ${editing.title}`,
        record_id: editing.id,
      });

      setEditing(null);
      fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record');
    }
  }

  async function handleDelete(id: string) {
    setError(null);

    try {
      const record = records.find((r) => r.id === id);
      const { error: deleteErr } = await supabase
        .from('records')
        .delete()
        .eq('id', id);

      if (deleteErr) throw deleteErr;

      await supabase.from('activity_log').insert({
        user_id: user?.id ?? null,
        action: `Deleted record: ${record?.title ?? id}`,
      });

      setDeleting(null);
      fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    }
  }

  const columns = useMemo<ColumnDef<DbRecord>[]>(
    () => [
      { accessorKey: 'title', header: 'Title', enableSorting: true },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ getValue }) => {
          const status = getValue<string>();
          const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-blue-100 text-blue-800',
          };
          return (
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-800'}`}>
              {status}
            </span>
          );
        },
      },
      { accessorKey: 'category', header: 'Category', enableSorting: true },
      {
        accessorKey: 'value',
        header: 'Value',
        enableSorting: true,
        cell: ({ getValue }) => {
          const v = getValue<number | null>();
          return v != null ? `$${v.toLocaleString()}` : '-';
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        enableSorting: true,
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() =>
                setEditing({
                  id: row.original.id,
                  title: row.original.title,
                  status: row.original.status,
                  category: row.original.category ?? '',
                  value: row.original.value?.toString() ?? '',
                })
              }
              className="text-sm text-indigo-600 hover:underline"
              aria-label={`Edit ${row.original.title}`}
            >
              Edit
            </button>
            <button
              onClick={() => setDeleting(row.original.id)}
              className="text-sm text-red-600 hover:underline"
              aria-label={`Delete ${row.original.title}`}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: records,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalCount / PAGE_SIZE),
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Records</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
          aria-label="Create new record"
        >
          + New Record
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          aria-label="Search records"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading records...</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="border-b px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer select-none"
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {{ asc: ' \u2191', desc: ' \u2193' }[h.column.getIsSorted() as string] ?? ''}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                      No records found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {page + 1} of {totalPages} ({totalCount} total records)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-label="Create record">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Create Record</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label htmlFor="create-title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  id="create-title"
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  aria-label="Record title"
                />
              </div>
              <div>
                <label htmlFor="create-status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="create-status"
                  value={createForm.status ?? 'active'}
                  onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value }))}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  aria-label="Record status"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="create-category" className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  id="create-category"
                  value={createForm.category ?? ''}
                  onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  aria-label="Record category"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="create-value" className="block text-sm font-medium text-gray-700">Value ($)</label>
                <input
                  id="create-value"
                  type="number"
                  step="0.01"
                  value={createForm.value ?? ''}
                  onChange={(e) => setCreateForm((f) => ({ ...f, value: e.target.value ? parseFloat(e.target.value) : null }))}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  aria-label="Record value"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-4 py-2 text-sm text-white font-medium hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-label="Edit record">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Edit Record</h2>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  id="edit-title"
                  type="text"
                  required
                  value={editing.title}
                  onChange={(e) => setEditing((prev) => prev ? { ...prev, title: e.target.value } : null)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  aria-label="Record title"
                />
              </div>
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="edit-status"
                  value={editing.status}
                  onChange={(e) => setEditing((prev) => prev ? { ...prev, status: e.target.value } : null)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  aria-label="Record status"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  id="edit-category"
                  value={editing.category}
                  onChange={(e) => setEditing((prev) => prev ? { ...prev, category: e.target.value } : null)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  aria-label="Record category"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-value" className="block text-sm font-medium text-gray-700">Value ($)</label>
                <input
                  id="edit-value"
                  type="number"
                  step="0.01"
                  value={editing.value}
                  onChange={(e) => setEditing((prev) => prev ? { ...prev, value: e.target.value } : null)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  aria-label="Record value"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-4 py-2 text-sm text-white font-medium hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-label="Confirm deletion">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Delete Record</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleting)}
                className="rounded bg-red-600 px-4 py-2 text-sm text-white font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
