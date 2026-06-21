import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminNavbar = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const initial = userData?.name?.charAt(0).toUpperCase();

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e0e0e0',
      padding: '0 24px',
      fontFamily: 'Inter, sans-serif',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
      }}>
        <Link
          to="/admin/dashboard"
          style={{
            fontWeight: '700',
            fontSize: '15px',
            color: '#111',
            textDecoration: 'none',
            letterSpacing: '-0.3px',
          }}
        >
          Admin Panel
        </Link>

        {/* Desktop links */}
        <div className="navbar-desktop" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link
            to="/admin/dashboard"
            style={{ fontSize: '13px', color: '#555', textDecoration: 'none', fontWeight: '500' }}
          >
            Dashboard
          </Link>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '24px',
            borderLeft: '1px solid #e0e0e0',
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: '#000',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700',
            }}>
              {initial}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
              {userData?.name}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                background: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '500',
                color: '#333',
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          style={{
            display: 'none',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '8px',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <span style={{
            width: '20px', height: '2px', background: '#111',
            transition: 'transform 0.2s',
            transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
          }} />
          <span style={{
            width: '20px', height: '2px', background: '#111',
            opacity: menuOpen ? 0 : 1,
            transition: 'opacity 0.2s',
          }} />
          <span style={{
            width: '20px', height: '2px', background: '#111',
            transition: 'transform 0.2s',
            transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
          }} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="navbar-mobile-menu" style={{
          display: 'none',
          flexDirection: 'column',
          padding: '12px 0 16px 0',
          borderTop: '1px solid #f0f0f0',
          gap: '4px',
        }}>
          <Link
            to="/admin/dashboard"
            onClick={() => setMenuOpen(false)}
            style={{
              fontSize: '14px', color: '#333', textDecoration: 'none',
              fontWeight: '500', padding: '10px 4px',
            }}
          >
            Dashboard
          </Link>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 4px', borderTop: '1px solid #f5f5f5', marginTop: '6px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#000', color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700',
            }}>
              {initial}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
              {userData?.name}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              marginTop: '8px',
              padding: '10px 14px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              background: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500',
              color: '#333',
              textAlign: 'left',
            }}
          >
            Logout
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .navbar-desktop { display: none !important; }
          .navbar-hamburger { display: flex !important; }
          .navbar-mobile-menu { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default AdminNavbar;