import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { accountAPI } from '../services/api';
import { validateAccountName, validateAmount } from '../utils/validation';

const CreateAccount = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();
  
  
  const initialName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() : '';

 
  const [formData, setFormData] = useState({
    accountHolderName: initialName,
    balance: '',
  });
  
  const [errors, setErrors] = useState({});
  
  const [error, setError] = useState(''); 
  const [createdAccount, setCreatedAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nameValidation = validateAccountName(formData.accountHolderName);
    if (!nameValidation.isValid) {
      newErrors.accountHolderName = nameValidation.error;
    }

    const amountValidation = validateAmount(formData.balance, { min: 1, max: 10000000 });
    if (!amountValidation.isValid) {
      newErrors.balance = amountValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCreatedAccount(null);
    setError(''); 

    if (!validateForm()) {
      showError('Please fix the errors below');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        accountHolderName: formData.accountHolderName.trim(),
        balance: Number(formData.balance),
      };

      const response = await accountAPI.createAccount(payload);
      setCreatedAccount(response.data);
      showSuccess('Account created successfully!');
      setFormData(prev => ({
        ...prev,
        balance: '',
      }));
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create account';
      showError(message);
      setError(message); 
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setErrors({});
    setError('');
    setCreatedAccount(null);
    setFormData({
      accountHolderName: user ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() : '',
      balance: '',
    });
  };

  return (
    <div className="fade-in">
      <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div className="card-header">
          <h2>Create New Account</h2>
          <p>Open a new bank account in minutes</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!createdAccount ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="accountHolderName">Account Holder Name *</label>
              <input
                type="text"
                id="accountHolderName"
                name="accountHolderName"
                placeholder="Enter account holder name"
                value={formData.accountHolderName}
                onChange={handleChange}
                disabled={loading}
                required
                aria-invalid={!!errors.accountHolderName}
              />
              {errors.accountHolderName && <span className="form-hint" style={{ color: 'var(--danger)' }}>⚠️ {errors.accountHolderName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="balance">Initial Balance (₹) *</label>
              <input
                type="number"
                id="balance"
                name="balance"
                placeholder="0.00"
                value={formData.balance}
                onChange={handleChange}
                step="0.01"
                min="0"
                disabled={loading}
                required
                aria-invalid={!!errors.balance}
              />
              {errors.balance && <span className="form-hint" style={{ color: 'var(--danger)' }}>⚠️ {errors.balance}</span>}
              {!errors.balance && (
                <small style={{ color: 'var(--text-light)', marginTop: '0.25rem', display: 'block' }}>
                  Minimum balance is ₹1.00 and the maximum initial deposit is ₹1,00,00,000.
                </small>
              )}
            </div>

            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '8px',
              background: 'var(--light)',
              border: '1px solid var(--border)'
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0' }}>Account Details</h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-light)' }}>
                <li>Daily transfer limit: ₹1,00,000</li>
                <li>Transaction history tracking enabled</li>
                <li>Account status starts as ACTIVE</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => navigate('/')}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'var(--border)',
                  color: 'var(--text-dark)',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="fade-in">
            <div className="alert alert-success">
              <span>✅</span>
              <span>Account created successfully.</span>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Account Number</p>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>{createdAccount.accountNumber}</p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Account Holder</p>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>{createdAccount.accountHolderName}</p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Initial Balance</p>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>
                  ₹{Number(createdAccount.balance || 0).toLocaleString()}
                </p>
              </div>

              {createdAccount.accountStatus && (
                <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Status</p>
                  <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>{createdAccount.accountStatus}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-primary" onClick={resetForm} style={{ flex: 1 }}>
                Create Another Account
              </button>
              <button type="button" className="btn" onClick={() => navigate('/')} style={{ flex: 1, background: 'var(--border)', color: 'var(--text-dark)' }}>
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAccount;