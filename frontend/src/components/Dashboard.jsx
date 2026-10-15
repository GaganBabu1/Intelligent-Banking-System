import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountAPI } from '../services/api';
import Loader from './Loader';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalBalance: 0,
    activeAccountCount: 0,
    recentTransactions: 0
  });

  useEffect(() => {
    
    const fetchDashboardData = async () => {
      try {
        
        if (user?.id) {
          const accountsResponse = await accountAPI.getUserAccounts(user.id);
          setAccounts(accountsResponse.data);

          
          let total = 0;
          let activeCount = 0;
          accountsResponse.data.forEach(acc => {
            if (acc.accountStatus === 'ACTIVE') {
              total += acc.balance;
              activeCount += 1;
            }
          });

          setStats(prev => ({
            ...prev,
            totalBalance: total,
            activeAccountCount: activeCount
          }));

          
          if (accountsResponse.data.length > 0) {
            try {
              const transResponse = await accountAPI.getTransactions(
                accountsResponse.data[0].accountNumber,
                0,
                5
              );
              setTransactions(transResponse.data.content || []);
            } catch {
             
              console.log('Could not fetch transactions');
            }
          }
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false); 
      }
    };

    fetchDashboardData();
  }, [user?.id]); 

  const handleAccountClick = (account) => {
    
    console.log('View account details:', account);
  };

  return (
    <div className="fade-in">
      {error && (
        <div className="alert alert-danger">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Welcome Section */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', color: 'white', marginBottom: '2rem' }}>
        <div className="card-header" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>
          <h2 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>Welcome, {user?.firstName}! 👋</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Manage your accounts and transactions</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <p style={{ opacity: 0.85, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Total Balance</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>₹{stats.totalBalance.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ opacity: 0.85, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Active Accounts</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>{stats.activeAccountCount}</p>
          </div>
          <div>
            <p style={{ opacity: 0.85, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Member Since</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>2024</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/create-account')}>
            ➕ Create Account
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/deposit')}>
            💰 Deposit
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/withdraw')}>
            🏧 Withdraw
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/transfer')}>
            ↔️ Transfer
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/history')}>
            📜 History
          </button>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="card">
        <div className="card-header">
          <h2>Your Accounts</h2>
          <p>{accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}</p>
        </div>

        {loading ? (
          <Loader message="Loading your accounts..." />
        ) : accounts.length > 0 ? (
          <div className="grid">
            {accounts.map((account) => (
              <div
                key={account.accountNumber}
                onClick={() => handleAccountClick(account)}
                style={{
                  padding: '1.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  background: 'white'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>Account Number</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>
                      #{account.accountNumber}
                    </p>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: account.accountStatus === 'ACTIVE' ? '#dcfce7' : account.accountStatus === 'FROZEN' ? '#fef3c7' : '#fee2e2',
                    color: account.accountStatus === 'ACTIVE' ? '#15803d' : account.accountStatus === 'FROZEN' ? '#92400e' : '#991b1b'
                  }}>
                    {account.accountStatus}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>Account Holder</p>
                  <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-dark)' }}>
                    {account.accountHolderName}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>Current Balance</p>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                    ₹{account.balance.toLocaleString()}
                  </p>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    Daily Transfer Limit
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-dark)' }}>
                    ₹{account.dailyTransferLimit.toLocaleString()} / ₹{account.dailyTransferUsed.toLocaleString()} used
                  </p>
                  <div style={{
                    marginTop: '0.5rem',
                    height: '6px',
                    background: 'var(--border)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      background: 'var(--success)',
                      width: `${Math.min((account.dailyTransferUsed / account.dailyTransferLimit) * 100, 100)}%`,
                      transition: 'var(--transition)'
                    }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>No accounts yet. Create one to get started!</p>
            <button className="btn btn-primary" onClick={() => navigate('/create-account')}>
              ➕ Create Your First Account
            </button>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h2>Recent Transactions</h2>
            <p>Your latest account activities</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      {transaction.type === 'DEPOSIT' && '💰 Deposit'}
                      {transaction.type === 'WITHDRAW' && '🏧 Withdraw'}
                      {transaction.type === 'TRANSFER_OUT' && '➡️ Transfer Out'}
                      {transaction.type === 'TRANSFER_IN' && '⬅️ Transfer In'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>₹{transaction.amount.toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        background: transaction.status === 'SUCCESS' ? '#dcfce7' : '#fee2e2',
                        color: transaction.status === 'SUCCESS' ? '#15803d' : '#991b1b'
                      }}>
                        {transaction.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/history')}>
              📜 View All Transactions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;