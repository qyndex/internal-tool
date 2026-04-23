import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthProvider';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/data', label: 'Records' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-6">Internal Tool</h2>
      <nav className="flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block py-2 px-3 rounded mb-1 ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <p className="text-sm text-gray-400 truncate mb-2" title={user.email ?? ''}>
            {user.email}
          </p>
          <button
            onClick={signOut}
            className="w-full rounded border border-gray-600 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
