import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDashboard = location.pathname === '/dashboard';
  const isWorkspace = location.pathname === '/workspace';

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'var(--bg-secondary)', borderBottomColor: 'var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} className="border-b">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '24px', paddingRight: '24px', paddingTop: '16px', paddingBottom: '16px', maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto' }}>
        <Link to="/workspace" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--accent)' }}>Peblo</span> Notes
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {(isWorkspace || isDashboard) && (
            <Link
              to={isDashboard ? '/workspace' : '/dashboard'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: isDashboard ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: isDashboard ? '2px solid var(--accent)' : 'none',
                paddingBottom: isDashboard ? '4px' : '0',
              }}
            >
              <LayoutDashboard size={18} />
              {isDashboard ? 'Workspace' : 'Dashboard'}
            </Link>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
            {user && <span style={{ color: 'var(--text-secondary)' }}>{user.name}</span>}
            <button
              onClick={toggleTheme}
              className="icon-button"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
