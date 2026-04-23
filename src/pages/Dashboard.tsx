import { useEffect, useState } from 'react';
import Chart from '../components/Chart';
import { supabase } from '../lib/supabase';
import type { ActivityLog } from '../types/database';

interface Stats {
  totalRecords: number;
  activeRecords: number;
  totalValue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all records to compute stats
        const { data: records, error: recordsErr } = await supabase
          .from('records')
          .select('status, value');

        if (recordsErr) throw recordsErr;

        const totalRecords = records?.length ?? 0;
        const activeRecords = records?.filter((r) => r.status === 'active').length ?? 0;
        const totalValue = records?.reduce((sum, r) => sum + (r.value ?? 0), 0) ?? 0;

        setStats({ totalRecords, activeRecords, totalValue });

        // Fetch recent activity
        const { data: activity, error: activityErr } = await supabase
          .from('activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (activityErr) throw activityErr;
        setRecentActivity(activity ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded bg-red-50 p-4 text-red-700" role="alert">
        <p className="font-medium">Error loading dashboard</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Records', value: stats?.totalRecords ?? 0 },
    { label: 'Active Records', value: stats?.activeRecords ?? 0 },
    { label: 'Total Value', value: `$${(stats?.totalValue ?? 0).toLocaleString()}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="text-lg font-semibold mb-3">Records by Month</h2>
        <Chart />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentActivity.map((entry) => (
              <li key={entry.id} className="py-2 flex justify-between items-center">
                <span className="text-sm text-gray-700">{entry.action}</span>
                <span className="text-xs text-gray-400">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
