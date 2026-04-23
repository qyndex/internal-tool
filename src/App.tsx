import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/AuthProvider';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DataTable from './pages/DataTable';
import Login from './pages/Login';
import Signup from './pages/Signup';

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data" element={<DataTable />} />
        </Routes>
      </main>
    </div>
  );
}

function AuthRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthRoutes />} />
        <Route path="/signup" element={<AuthRoutes />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
