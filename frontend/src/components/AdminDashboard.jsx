import { useState, useEffect } from 'react';
import { adminAPI, accountAPI } from '../services/api';
import Loader from './Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalActiveBalance: 0,
    totalUsers: 0,
    activeAccounts: 0,
    frozenAccounts: 0,
  });
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [anomalyQueue, setAnomalyQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');



  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        
        
        const statsResponse = await adminAPI.getStatistics();
        setStats(statsResponse.data);

        const usersResponse = await adminAPI.getAllUsers();
        setUsers(usersResponse.data);

        const accountsResponse = await accountAPI.getAllAccounts(0, 20);
        setAccounts(accountsResponse.data.content);

        try {
          const anomalyResponse = await adminAPI.getAnomalyQueue();
          setAnomalyQueue(anomalyResponse.data);
        } catch {
          console.log('Could not fetch anomaly attention queue');
        }
      } catch (err) {
        setError('Failed to load admin data');
        console.error(err);
      } finally {
        
        setLoading(false);
      }
    };

    
    fetchDashboardData();
  }, []);

  return (
    <div className="fade-in">
      {error && (
        <div className="alert alert-danger">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Admin Dashboard</h2>
          <p>System statistics and management</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={`btn ${activeTab === 'accounts' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            💼 Accounts
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="value">{stats.totalUsers}</p>
              <p>Registered users</p>
            </div>

            <div className="stat-card">
              <h3>Total Accounts</h3>
              <p className="value">{stats.totalAccounts}</p>
              <p>Bank accounts</p>
            </div>

            <div className="stat-card">
              <h3>Active Accounts</h3>
              <p className="value">{stats.activeAccounts}</p>
              <p>Currently active</p>
            </div>

            <div className="stat-card">
              <h3>Frozen Accounts</h3>
              <p className="value">{stats.frozenAccounts}</p>
              <p>Temporarily frozen</p>
            </div>

            <div className="stat-card">
              <h3>Total Active Balance</h3>
              <p className="value">₹{(stats.totalActiveBalance || 0).toLocaleString()}</p>
              <p>Across all active accounts</p>
            </div>
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="card-header">
              <h2>Transaction Attention Queue</h2>
              <p>Explainable risk items for administrator review</p>
            </div>

            {anomalyQueue.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '1rem' }}>Priority</th>
                      <th style={{ textAlign: 'left', padding: '1rem' }}>Account</th>
                      <th style={{ textAlign: 'left', padding: '1rem' }}>Risk Score</th>
                      <th style={{ textAlign: 'left', padding: '1rem' }}>Reason</th>
                      <th style={{ textAlign: 'left', padding: '1rem' }}>Factors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalyQueue.map((item) => (
                      <tr key={`${item.accountReference}-${item.riskScore}`} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            background: item.priority === 'HIGH' ? '#fee2e2' : '#fef3c7',
                            color: item.priority === 'HIGH' ? '#991b1b' : '#92400e'
                          }}>
                            {item.priority}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{item.accountReference}</td>
                        <td style={{ padding: '1rem', fontWeight: '700' }}>{item.riskScore}/100</td>
                        <td style={{ padding: '1rem', minWidth: '260px' }}>{item.reason}</td>
                        <td style={{ padding: '1rem', minWidth: '300px' }}>
                          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                            {item.factors.map((factor) => <li key={factor}>{factor}</li>)}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No risk items require review.</p>
            )}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h2>Registered Users</h2>
            <p>Total users: {users.length}</p>
          </div>

          {loading ? (
            <Loader message="Loading users..." />
          ) : users.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>{user.firstName} {user.lastName}</td>
                      <td style={{ padding: '1rem' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>{user.phoneNumber}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: user.role === 'ADMIN' ? '#fef3c7' : '#dbeafe',
                          color: user.role === 'ADMIN' ? '#92400e' : '#1e40af'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: user.enabled ? '#dcfce7' : '#fee2e2',
                          color: user.enabled ? '#15803d' : '#991b1b'
                        }}>
                          {user.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No users found</p>
          )}
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="card">
          <div className="card-header">
            <h2>Bank Accounts</h2>
            <p>Total accounts: {accounts.length}</p>
          </div>

          {loading ? (
            <Loader message="Loading accounts..." />
          ) : accounts.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Account Number</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Holder</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Balance</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.accountNumber} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>#{account.accountNumber}</td>
                      <td style={{ padding: '1rem' }}>{account.accountHolderName}</td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--success)' }}>
                        ₹{account.balance.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: account.accountStatus === 'ACTIVE' ? '#dcfce7' : account.accountStatus === 'FROZEN' ? '#fef3c7' : '#fee2e2',
                          color: account.accountStatus === 'ACTIVE' ? '#15803d' : account.accountStatus === 'FROZEN' ? '#92400e' : '#991b1b'
                        }}>
                          {account.accountStatus}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                        {new Date(account.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No accounts found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
