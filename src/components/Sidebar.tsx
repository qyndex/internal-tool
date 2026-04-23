import { Link } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/data', label: 'Data Table' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <h2 className="text-lg font-bold mb-6">Internal Tool</h2>
      <nav>
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className="block py-2 px-3 rounded hover:bg-gray-700">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
