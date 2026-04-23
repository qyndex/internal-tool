import Chart from '../components/Chart';

interface StatCard {
  label: string;
  value: number;
}

const stats: StatCard[] = [
  { label: 'Users', value: 1284 },
  { label: 'Revenue', value: 45200 },
  { label: 'Orders', value: 312 },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>
      <Chart />
    </div>
  );
}
