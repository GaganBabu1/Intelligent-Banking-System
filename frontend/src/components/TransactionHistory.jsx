import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountAPI, transactionAPI } from '../services/api';
import Loader from './Loader';

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const SCOPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'incoming', label: 'Incoming' },
  { value: 'outgoing', label: 'Outgoing' }
];
const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'DEPOSIT', label: 'Deposit' },
  { value: 'WITHDRAW', label: 'Withdraw' },
  { value: 'TRANSFER_OUT', label: 'Transfer Out' },
  { value: 'TRANSFER_IN', label: 'Transfer In' }
];

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [scope, setScope] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [pageData, setPageData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10,
    first: true,
    last: true
  });
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [error, setError] = useState('');

  const currentAccount = useMemo(
    () => accounts.find(account => String(account.accountNumber) === String(selectedAccount)),
    [accounts, selectedAccount]
  );

  const fetchTransactions = async () => {
    if (!selectedAccount) {
      setPageData({
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size,
        first: true,
        last: true
      });
      return;
    }

    try {
      setLoading(true);
      setError('');

      let result;
      if (scope === 'incoming') {
        result = await transactionAPI.getIncomingTransactions(selectedAccount, page, size);
      } else if (scope === 'outgoing') {
        result = await transactionAPI.getOutgoingTransactions(selectedAccount, page, size);
      } else {
        result = await transactionAPI.getTransactions(selectedAccount, page, size);
      }

      setPageData(result.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transaction history');
      setPageData({
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size,
        first: true,
        last: true
      });
    } finally {
      setLoading(false);
    }
  };

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
        if (userAccounts.length > 0) {
          setSelectedAccount(String(userAccounts[0].accountNumber));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your accounts');
      } finally {
        setAccountsLoading(false);
      }
    };

    loadAccounts();
  }, [user?.id]);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!selectedAccount) {
        setPageData({
          content: [],
          totalPages: 0,
          totalElements: 0,
          number: 0,
          size,
          first: true,
          last: true
        });
        return;
      }

      try {
        setLoading(true);
        setError('');

        let result;
        if (scope === 'incoming') {
          result = await transactionAPI.getIncomingTransactions(selectedAccount, page, size);
        } else if (scope === 'outgoing') {
          result = await transactionAPI.getOutgoingTransactions(selectedAccount, page, size);
        } else {
          result = await transactionAPI.getTransactions(selectedAccount, page, size);
        }

        setPageData(result.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load transaction history');
        setPageData({
          content: [],
          totalPages: 0,
          totalElements: 0,
          number: 0,
          size,
          first: true,
          last: true
        });
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [selectedAccount, scope, page, size]);

  const handleAccountChange = (event) => {
    setSelectedAccount(event.target.value);
    setPage(0);
  };

  const handleScopeChange = (event) => {
    setScope(event.target.value);
    setPage(0);
  };

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return (pageData.content || []).filter(transaction => {
      if (typeFilter !== 'all' && transaction.type !== typeFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableValues = [
        transaction.transactionRef,
        transaction.description,
        transaction.type,
        transaction.status,
        transaction.fromAccountNumber,
        transaction.toAccountNumber
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableValues.includes(query);
    });
  }, [pageData.content, searchTerm, typeFilter]);

  const resetFilters = () => {
    setScope('all');
    setTypeFilter('all');
    setSearchTerm('');
    setPage(0);
    if (accounts.length > 0) {
      setSelectedAccount(String(accounts[0].accountNumber));
    }
  };

  const canGoBack = pageData.number > 0;
  const canGoForward = !pageData.last && pageData.totalPages > 0;

  return (
    <div className="fade-in">
      <div className="card" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="card-header">
          <h2>Transaction History</h2>
          <p>Paginated transaction history with account, scope, type, and search filters</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="account">Account *</label>
            <select
              id="account"
              value={selectedAccount}
              onChange={handleAccountChange}
              disabled={accountsLoading || accounts.length === 0}
            >
              <option value="">Choose an account</option>
              {accounts.map(account => (
                <option key={account.accountNumber} value={account.accountNumber}>
                  #{account.accountNumber} - {account.accountHolderName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="scope">Transaction Scope</label>
            <select id="scope" value={scope} onChange={handleScopeChange} disabled={loading || !selectedAccount}>
              {SCOPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="typeFilter">Transaction Type</label>
            <select id="typeFilter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} disabled={loading || !selectedAccount}>
              {TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="searchTerm">Search</label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Ref, description, type..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              disabled={loading || !selectedAccount}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button className="btn btn-secondary" type="button" onClick={fetchTransactions} disabled={loading || !selectedAccount}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button className="btn" type="button" onClick={resetFilters} disabled={loading || accounts.length === 0} style={{ background: 'var(--border)', color: 'var(--text-dark)' }}>
            Reset Filters
          </button>
          <button className="btn" type="button" onClick={() => navigate('/')} style={{ background: 'var(--border)', color: 'var(--text-dark)' }}>
            Back to Dashboard
          </button>
        </div>

        {currentAccount && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <h3>Account Holder</h3>
              <p className="value" style={{ fontSize: '1.2rem' }}>{currentAccount.accountHolderName}</p>
              <p>#{currentAccount.accountNumber}</p>
            </div>
            <div className="stat-card">
              <h3>Balance</h3>
              <p className="value">₹{Number(currentAccount.balance || 0).toLocaleString()}</p>
              <p>Current available balance</p>
            </div>
            <div className="stat-card">
              <h3>Daily Limit Used</h3>
              <p className="value">₹{Number(currentAccount.dailyTransferUsed || 0).toLocaleString()}</p>
              <p>of ₹{Number(currentAccount.dailyTransferLimit || 0).toLocaleString()}</p>
            </div>
          </div>
        )}

        {loading ? (
          <Loader message="Loading transaction history..." />
        ) : filteredTransactions.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Ref</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const incoming = transaction.type === 'DEPOSIT' || transaction.type === 'TRANSFER_IN';
                    const badgeClass = transaction.status === 'SUCCESS'
                      ? 'success'
                      : transaction.status === 'FAILED'
                        ? 'danger'
                        : 'info';

                    return (
                      <tr key={transaction.transactionRef || transaction.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : '—'}
                        </td>
                        <td style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
                          {transaction.transactionRef || '—'}
                        </td>
                        <td>
                          <span className={`badge badge-${incoming ? 'success' : transaction.type === 'WITHDRAW' ? 'danger' : 'info'}`}>
                            {transaction.type || 'UNKNOWN'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${badgeClass}`}>
                            {transaction.status || 'UNKNOWN'}
                          </span>
                        </td>
                        <td>{transaction.fromAccountNumber || '—'}</td>
                        <td>{transaction.toAccountNumber || '—'}</td>
                        <td style={{ fontWeight: 600 }}>
                          <span style={{ color: incoming ? 'var(--success)' : 'var(--danger)' }}>
                            {incoming ? '+' : '-'}₹{Number(transaction.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td>
                          {transaction.balanceAfter !== undefined && transaction.balanceAfter !== null
                            ? `₹${Number(transaction.balanceAfter).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ color: 'var(--text-light)' }}>
                Showing {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? '' : 's'} on page {pageData.number + 1} of {pageData.totalPages || 1}
                {' '}| Total matching records: {pageData.totalElements}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                  Page size
                  <select value={size} onChange={(event) => { setSize(Number(event.target.value)); setPage(0); }} disabled={loading} style={{ width: 'auto' }}>
                    {PAGE_SIZE_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <button className="btn" type="button" onClick={() => setPage(0)} disabled={!canGoBack || loading} style={{ background: 'var(--border)', color: 'var(--text-dark)' }}>
                  First
                </button>
                <button className="btn" type="button" onClick={() => setPage(prev => Math.max(prev - 1, 0))} disabled={!canGoBack || loading} style={{ background: 'var(--border)', color: 'var(--text-dark)' }}>
                  Previous
                </button>
                <button className="btn" type="button" onClick={() => setPage(prev => prev + 1)} disabled={!canGoForward || loading} style={{ background: 'var(--border)', color: 'var(--text-dark)' }}>
                  Next
                </button>
                <button className="btn" type="button" onClick={() => setPage(Math.max((pageData.totalPages || 1) - 1, 0))} disabled={!canGoForward || loading} style={{ background: 'var(--border)', color: 'var(--text-dark)' }}>
                  Last
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <p style={{ fontSize: '3rem', margin: '1rem 0' }}>📭</p>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)' }}>No Transactions Found</h3>
            <p style={{ color: 'var(--text-light)', margin: '0' }}>
              {selectedAccount ? 'Try changing the filters or selecting a different account.' : 'Select an account to view its transaction history.'}
            </p>
            {accountsLoading && (
              <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Loading accounts...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
