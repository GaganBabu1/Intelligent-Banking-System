import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show layout on auth pages
  if (!isAuthenticated || ['/login', '/register'].includes(location.pathname)) {
    return children;
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>🏦 BankHub</h1>
          <p>Secure Banking</p>
        </div>
        
        <nav>
          <ul className="sidebar-menu">
            <li>
              <Link 
                to="/" 
                className={isActive('/') ? 'active' : ''}
              >
                <span>📊</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/accounts" 
                className={isActive('/accounts') ? 'active' : ''}
              >
                <span>💳</span>
                Accounts
              </Link>
            </li>
            <li>
              <Link 
                to="/create-account" 
                className={isActive('/create-account') ? 'active' : ''}
              >
                <span>➕</span>
                New Account
              </Link>
            </li>
            <li>
              <Link 
                to="/deposit" 
                className={isActive('/deposit') ? 'active' : ''}
              >
                <span>💰</span>
                Deposit
              </Link>
            </li>
            <li>
              <Link 
                to="/withdraw" 
                className={isActive('/withdraw') ? 'active' : ''}
              >
                <span>🏧</span>
                Withdraw
              </Link>
            </li>
            <li>
              <Link 
                to="/transfer" 
                className={isActive('/transfer') ? 'active' : ''}
              >
                <span>↔️</span>
                Transfer
              </Link>
            </li>
            <li>
              <Link 
                to="/history" 
                className={isActive('/history') ? 'active' : ''}
              >
                <span>📜</span>
                History
              </Link>
            </li>
            <li>
              <Link 
                to="/profile" 
                className={isActive('/profile') ? 'active' : ''}
              >
                <span>👤</span>
                Profile
              </Link>
            </li>
            {isAdmin && (
              <>
                <li className="divider"></li>
                <li className="menu-label">Admin</li>
                <li>
                  <Link 
                    to="/admin" 
                    className={isActive('/admin') ? 'active' : ''}
                  >
                    <span>⚙️</span>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/users" 
                    className={isActive('/admin/users') ? 'active' : ''}
                  >
                    <span>👥</span>
                    Users
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/accounts" 
                    className={isActive('/admin/accounts') ? 'active' : ''}
                  >
                    <span>💼</span>
                    Accounts
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-mini">
            <div className="user-avatar">{user?.firstName?.[0]}</div>
            <div>
              <p>{user?.firstName} {user?.lastName}</p>
              <span>{user?.role}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <h2 className="header-title">Banking System</h2>
          </div>
          
          <div className="header-right">
            <div className="header-info">
              <span>⏰ {new Date().toLocaleTimeString()}</span>
            </div>
            
            <div className="user-menu">
              <button 
                className="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar-sm">{user?.firstName?.[0]}</div>
                <span>{user?.firstName}</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <Link to="/profile" onClick={() => setShowUserMenu(false)}>👤 Profile</Link>
                  <Link to="/profile?edit=true" onClick={() => setShowUserMenu(false)}>✏️ Edit Profile</Link>
                  <hr />
                  <button onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
