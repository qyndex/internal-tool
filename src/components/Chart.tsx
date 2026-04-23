import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';

interface MonthData {
  month: string;
  count: number;
  value: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Chart() {
  const [data, setData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      const { data: records, error } = await supabase
        .from('records')
        .select('created_at, value');

      if (error || !records) {
        setLoading(false);
        return;
      }

      // Group records by month
      const byMonth = new Map<string, { count: number; value: number }>();

      for (const record of records) {
        const date = new Date(record.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = byMonth.get(key) ?? { count: 0, value: 0 };
        existing.count += 1;
        existing.value += record.value ?? 0;
        byMonth.set(key, existing);
      }

      // Sort by key and format for chart
      const sorted = Array.from(byMonth.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, val]) => {
          const monthIndex = parseInt(key.split('-')[1], 10) - 1;
          return {
            month: MONTH_NAMES[monthIndex],
            count: val.count,
            value: val.value,
          };
        });

      setData(sorted);
      setLoading(false);
    }

    fetchChartData();
  }, []);

  if (loading) {
    return <div className="h-[300px] flex items-center justify-center text-gray-400">Loading chart...</div>;
  }

  if (data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-gray-400">No data to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Line yAxisId="left" type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} name="Value ($)" />
        <Line yAxisId="right" type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="Records" />
      </LineChart>
    </ResponsiveContainer>
  );
}
