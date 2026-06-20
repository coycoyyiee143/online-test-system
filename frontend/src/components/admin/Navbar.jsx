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

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e0e0e0',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '56px',
      fontFamily: 'Inter, sans-serif',
      position: 'sticky',
      top: 0,
      zIndex: 100,
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
            {userData?.name?.charAt(0).toUpperCase()}
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
    </nav>
  );
};

export default AdminNavbar;