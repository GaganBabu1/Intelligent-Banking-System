import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountAPI } from '../services/api';

const Withdraw = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: ''
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAccounts = async () => {
      if (!user?.id) {
        setAccountsLoading(false);
        return;
      }

      try {
        const result = await accountAPI.getUserAccounts(user.id);
        const userAccounts = Array.isArray(result.data) ? result.data : [];
        setAccounts(userAccounts);

        if (userAccounts.length === 1) {
          setFormData(prev => ({
            ...prev,
            accountNumber: String(userAccounts[0].accountNumber)
          }));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your accounts');
      } finally {
        setAccountsLoading(false);
      }
    };

    loadAccounts();
  }, [user?.id]);

  const selectedAccount = useMemo(
    () => accounts.find(account => String(account.accountNumber) === String(formData.accountNumber)),
    [accounts, formData.accountNumber]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.accountNumber) {
      setError('Please select an account');
      return false;
    }

    const amount = Number(formData.amount);
    if (!formData.amount || Number.isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (amount > 10000000) {
      setError('Amount cannot exceed ₹1,00,00,000');
      return false;
    }

    if (selectedAccount && amount > Number(selectedAccount.balance || 0)) {
      setError('Withdrawal amount cannot exceed the available balance');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResponse(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        accountNumber: Number(formData.accountNumber),
        amount: Number(formData.amount)
      };

      const result = await accountAPI.withdraw(payload);
      setResponse(result.data);
      setFormData(prev => ({
        ...prev,
        amount: ''
      }));
    } catch (err) {
      const message = err.response?.data?.message || 'Withdrawal failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setResponse(null);
    setFormData({
      accountNumber: accounts.length === 1 ? String(accounts[0].accountNumber) : '',
      amount: ''
    });
  };

  const isBusy = loading || accountsLoading;

  return (
    <div className="fade-in">
      <div className="card" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div className="card-header">
          <h2>Withdraw Money</h2>
          <p>Withdraw cash from one of your accounts</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!response ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="accountNumber">Select Account *</label>
              <select
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                disabled={isBusy || accounts.length === 0}
                required
              >
                <option value="">Choose an account</option>
                {accounts.map(account => (
                  <option key={account.accountNumber} value={account.accountNumber}>
                    #{account.accountNumber} - {account.accountHolderName} ({account.accountStatus})
                  </option>
                ))}
              </select>
              {accountsLoading ? (
                <small style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Loading your accounts...</small>
              ) : accounts.length === 0 ? (
                <small style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  No accounts available. Create an account first.
                </small>
              ) : selectedAccount ? (
                <small style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  Available balance: ₹{Number(selectedAccount.balance || 0).toLocaleString()}
                </small>
              ) : null}
            </div>

            <div className="form-group">
              <label htmlFor="amount">Withdrawal Amount (₹) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                disabled={isBusy || accounts.length === 0}
                required
              />
              <small style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>
                Withdrawals are checked against the current available balance before submission.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={isBusy || accounts.length === 0}
                style={{ flex: 1 }}
              >
                {loading ? 'Processing...' : 'Withdraw Money'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => navigate('/')}
                disabled={isBusy}
                style={{ flex: 1, background: 'var(--border)', color: 'var(--text-dark)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="fade-in">
            <div className="alert alert-success">
              <span>✅</span>
              <span>Withdrawal successful.</span>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Account Number</p>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>{response.accountNumber}</p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Account Holder</p>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>{response.accountHolderName}</p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--danger)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Amount Withdrawn</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'var(--danger)' }}>
                  -₹{Number(formData.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>

              {response.balance !== undefined && (
                <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Remaining Balance</p>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                    ₹{Number(response.balance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              {response.transactionRef && (
                <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Transaction Reference</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, wordBreak: 'break-all' }}>{response.transactionRef}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={resetForm} className="btn btn-secondary" style={{ flex: 1 }}>
                Withdraw More Money
              </button>
              <button type="button" onClick={() => navigate('/history')} className="btn" style={{ flex: 1, background: 'var(--border)', color: 'var(--text-dark)' }}>
                View History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;
