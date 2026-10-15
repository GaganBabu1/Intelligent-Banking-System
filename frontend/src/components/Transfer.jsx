import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountAPI } from '../services/api';

const Transfer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
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
            fromAccount: String(userAccounts[0].accountNumber)
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

  const fromAccountDetails = useMemo(
    () => accounts.find(account => String(account.accountNumber) === String(formData.fromAccount)),
    [accounts, formData.fromAccount]
  );

  const toAccountDetails = useMemo(
    () => accounts.find(account => String(account.accountNumber) === String(formData.toAccount)),
    [accounts, formData.toAccount]
  );

  const dailyRemaining = useMemo(() => {
    if (!fromAccountDetails) return 0;
    return Number(fromAccountDetails.dailyTransferLimit || 0) - Number(fromAccountDetails.dailyTransferUsed || 0);
  }, [fromAccountDetails]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fromAccount) {
      setError('Please select a source account');
      return false;
    }

    if (!formData.toAccount) {
      setError('Please enter a recipient account number');
      return false;
    }

    if (String(formData.fromAccount) === String(formData.toAccount)) {
      setError('Source and recipient accounts cannot be the same');
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

    if (fromAccountDetails && amount > Number(fromAccountDetails.balance || 0)) {
      setError('Transfer amount cannot exceed the available balance');
      return false;
    }

    if (amount > dailyRemaining) {
      setError('Transfer amount exceeds your remaining daily transfer limit');
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
        fromAccount: Number(formData.fromAccount),
        toAccount: Number(formData.toAccount),
        amount: Number(formData.amount)
      };

      const result = await accountAPI.transfer(payload);
      setResponse(result.data);
      setFormData(prev => ({
        ...prev,
        amount: ''
      }));
    } catch (err) {
      const message = err.response?.data?.message || 'Transfer failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setResponse(null);
    setFormData({
      fromAccount: accounts.length === 1 ? String(accounts[0].accountNumber) : '',
      toAccount: '',
      amount: ''
    });
  };

  const isBusy = loading || accountsLoading;

  return (
    <div className="fade-in">
      <div className="card" style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div className="card-header">
          <h2>Transfer Money</h2>
          <p>Send money between accounts and track your remaining daily limit</p>
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
              <label htmlFor="fromAccount">From Account *</label>
              <select
                id="fromAccount"
                name="fromAccount"
                value={formData.fromAccount}
                onChange={handleChange}
                disabled={isBusy || accounts.length === 0}
                required
              >
                <option value="">Choose source account</option>
                {accounts.map(account => (
                  <option key={account.accountNumber} value={account.accountNumber}>
                    #{account.accountNumber} - {account.accountHolderName} ({account.accountStatus})
                  </option>
                ))}
              </select>
              {accountsLoading ? (
                <small style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Loading your accounts...</small>
              ) : fromAccountDetails ? (
                <small style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  Balance: ₹{Number(fromAccountDetails.balance || 0).toLocaleString()} | Daily limit remaining: ₹{dailyRemaining.toLocaleString()}
                </small>
              ) : null}
            </div>

            <div className="form-group">
              <label htmlFor="toAccount">To Account Number *</label>
              <input
                type="number"
                id="toAccount"
                name="toAccount"
                placeholder="Recipient account number"
                value={formData.toAccount}
                onChange={handleChange}
                disabled={isBusy || accounts.length === 0}
                required
              />
              {toAccountDetails ? (
                <small style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  Recipient: {toAccountDetails.accountHolderName} | Status: {toAccountDetails.accountStatus}
                </small>
              ) : (
                <small style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  Enter the destination account number.
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="amount">Transfer Amount (₹) *</label>
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
              {fromAccountDetails ? (
                <small style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  Available balance: ₹{Number(fromAccountDetails.balance || 0).toLocaleString()} | Remaining daily limit: ₹{dailyRemaining.toLocaleString()}
                </small>
              ) : null}
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', padding: '1rem', borderRadius: '8px', background: 'var(--light)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-light)' }}>Daily transfer limit</span>
                <strong>₹{Number(fromAccountDetails?.dailyTransferLimit || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-light)' }}>Used today</span>
                <strong>₹{Number(fromAccountDetails?.dailyTransferUsed || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-light)' }}>Remaining today</span>
                <strong style={{ color: 'var(--success)' }}>₹{dailyRemaining.toLocaleString()}</strong>
              </div>
              <div style={{ height: '8px', borderRadius: '999px', overflow: 'hidden', background: 'var(--border)' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${fromAccountDetails?.dailyTransferLimit ? Math.min((Number(fromAccountDetails.dailyTransferUsed || 0) / Number(fromAccountDetails.dailyTransferLimit)) * 100, 100) : 0}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--secondary))'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isBusy || accounts.length === 0} style={{ flex: 1 }}>
                {loading ? 'Processing Transfer...' : 'Transfer Money'}
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
              <span>Transfer completed successfully.</span>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>From Account</p>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{response.fromAccountNumber || formData.fromAccount}</p>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                  Holder: {response.fromAccountHolderName || fromAccountDetails?.accountHolderName || 'N/A'}
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>To Account</p>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{response.toAccountNumber || formData.toAccount}</p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Amount Transferred</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)' }}>
                  ₹{Number(formData.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>

              {response.balance !== undefined && (
                <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--info, var(--secondary))' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Remaining Balance</p>
                  <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>
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
                Make Another Transfer
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

export default Transfer;
