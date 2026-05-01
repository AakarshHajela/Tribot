// ===== SHARED ADMIN NAV =====
import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { logout } from '../api/authApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { ProfileDropdown } from './ProfileDropdown';

interface AdminNavBarProps {
  activePage: 'users' | 'history' | 'changelog';
}

function linkStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: '14px',
    color: active ? '#185FA5' : '#5F5E5A',
    fontWeight: active ? 500 : 400,
  };
}

export function AdminNavBar({ activePage }: AdminNavBarProps) {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const adminInitials = (() => {
    if (!user?.full_name) return '?';
    const words = user.full_name.trim().split(/\s+/);
    const first = words[0][0] ?? '';
    const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
    return (first + last).toUpperCase();
  })();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); };

  return (
    <nav className="bg-white" style={{ borderBottom: '0.5px solid #E0DED6' }}>
      <div style={{ height: '52px' }} className="px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Logo and Nav Links */}
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Hamburger (mobile only) */}
          <button
            className="lg:hidden flex items-center justify-center"
            style={{ color: '#5F5E5A' }}
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center"
              style={{ width: '28px', height: '28px', backgroundColor: '#185FA5', borderRadius: '5px' }}
            >
              <span className="text-white font-semibold">T</span>
            </div>
            <span className="hidden sm:inline font-semibold" style={{ fontSize: '16px', color: '#1A1A1A' }}>
              TRIBOT
            </span>
          </div>

          {/* Nav Links — desktop only */}
          <div className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => navigate('/admin')}
              className="transition-colors"
              style={linkStyle(activePage === 'users')}
            >
              Users
            </button>
            <button
              onClick={() => navigate('/admin/sessions')}
              className="transition-colors"
              style={linkStyle(activePage === 'history')}
            >
              History
            </button>
            <button
              onClick={() => navigate('/admin/changelog')}
              className="transition-colors"
              style={linkStyle(activePage === 'changelog')}
            >
              Change log
            </button>
          </div>
        </div>

        {/* Right: Admin Badge, Avatar, Divider, Logout */}
        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex px-3 py-1"
            style={{
              border: '1px solid #A32D2D',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#A32D2D',
              fontWeight: 500,
            }}
          >
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'}
          </div>
          <ProfileDropdown user={user ?? null} initials={adminInitials} />

          {/* Vertical Divider */}
          <div style={{ width: '1px', height: '20px', backgroundColor: '#E0DED6' }} />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 group transition-colors"
          >
            <LogOut
              size={14}
              className="transition-colors group-hover:text-[#A32D2D]"
              style={{ color: '#5F5E5A' }}
            />
            <span
              className="hidden lg:inline transition-colors group-hover:text-[#A32D2D]"
              style={{ fontSize: '13px', color: '#5F5E5A' }}
            >
              Log out
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t px-4 py-3 flex flex-col gap-3" style={{ borderColor: '#E0DED6', backgroundColor: '#fff' }}>
          <button
            onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
            className="text-left transition-colors"
            style={linkStyle(activePage === 'users')}
          >
            Users
          </button>
          <button
            onClick={() => { navigate('/admin/sessions'); setMobileMenuOpen(false); }}
            className="text-left transition-colors"
            style={linkStyle(activePage === 'history')}
          >
            History
          </button>
          <button
            onClick={() => { navigate('/admin/changelog'); setMobileMenuOpen(false); }}
            className="text-left transition-colors"
            style={linkStyle(activePage === 'changelog')}
          >
            Change log
          </button>
          <div style={{ borderTop: '1px solid #E0DED6', paddingTop: '8px' }}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 group transition-colors"
            >
              <LogOut size={14} style={{ color: '#5F5E5A' }} />
              <span style={{ fontSize: '13px', color: '#5F5E5A' }}>Log out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
// ===== END SHARED ADMIN NAV =====
