// ===== ADMIN LAYOUT  =====
import { Outlet, useLocation } from 'react-router';
import { AdminNavBar } from '../components/AdminNavBar';

function getActivePage(pathname: string): 'users' | 'history' | 'changelog' {
  if (pathname.startsWith('/admin/sessions')) return 'history';
  if (pathname.startsWith('/admin/changelog')) return 'changelog';
  return 'users';
}

export function AdminLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F6F8' }}>
      <AdminNavBar activePage={getActivePage(location.pathname)} />
      <Outlet />
    </div>
  );
}
// ===== END ADMIN LAYOUT =====
