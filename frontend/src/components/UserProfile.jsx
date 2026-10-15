import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../services/api';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

const formatMemberSince = (value) => {
  if (!value) return '—';
  return new Date(value).getFullYear();
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
 
  const [editing, setEditing] = useState(() => searchParams.get('edit') === 'true');
  const [error, setError] = useState('');

  const userId = useMemo(() => user?.id, [user?.id]);

  
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setError('');
        const response = await userAPI.getProfile(userId);
        const data = response.data;
        setProfile(data);
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }

    return true;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const response = await userAPI.updateProfile(userId, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
      });

      const updatedProfile = response.data;
      setProfile(updatedProfile);
      updateUser({
        ...user,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
        phoneNumber: updatedProfile.phoneNumber,
        address: updatedProfile.address,
      });
      setFormData({
        firstName: updatedProfile.firstName || '',
        lastName: updatedProfile.lastName || '',
        email: updatedProfile.email || '',
        phoneNumber: updatedProfile.phoneNumber || '',
        address: updatedProfile.address || '',
      });
      setEditing(false);
      showToast('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
      });
    }
    setEditing(false);
    setError('');
  };

  const initials = profile
    ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase()
    : '';

  return (
    <div className="fade-in">
      {error && (
        <div className="alert alert-danger">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner spinner-lg"></div>
          <p>Loading profile...</p>
        </div>
      ) : profile ? (
        <div className="profile-page">
          <div className="profile-hero">
            <div className="profile-hero-content">
              <div className="profile-avatar-lg">{initials}</div>
              <div>
                <h2>{profile.firstName} {profile.lastName}</h2>
                <p>{profile.email}</p>
                <div className="profile-badges">
                  <span className={`badge ${profile.role === 'ADMIN' ? 'badge-info' : 'badge-success'}`}>
                    {profile.role}
                  </span>
                  <span className={`badge ${profile.enabled ? 'badge-success' : 'badge-danger'}`}>
                    {profile.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
            {!editing && (
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => setEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <h3>Member Since</h3>
              <p className="value">{formatMemberSince(profile.createdAt)}</p>
              <p>Account created</p>
            </div>
            <div className="stat-card">
              <h3>Last Login</h3>
              <p className="value" style={{ fontSize: '1.1rem' }}>
                {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : '—'}
              </p>
              <p>Most recent session</p>
            </div>
            <div className="stat-card">
              <h3>Phone</h3>
              <p className="value" style={{ fontSize: '1.1rem' }}>{profile.phoneNumber || '—'}</p>
              <p>Contact number</p>
            </div>
          </div>

          <div className="profile-grid">
            <div className="card profile-card">
              <div className="card-header">
                <h3>Account Details</h3>
                <p>Your banking account metadata</p>
              </div>
              <dl className="profile-details">
                <div className="profile-detail-row">
                  <dt>User ID</dt>
                  <dd>#{profile.id}</dd>
                </div>
                <div className="profile-detail-row">
                  <dt>Role</dt>
                  <dd>{profile.role}</dd>
                </div>
                <div className="profile-detail-row">
                  <dt>Status</dt>
                  <dd>{profile.enabled ? 'Active' : 'Disabled'}</dd>
                </div>
                <div className="profile-detail-row">
                  <dt>Created At</dt>
                  <dd>{formatDate(profile.createdAt)}</dd>
                </div>
                <div className="profile-detail-row">
                  <dt>Last Login</dt>
                  <dd>{formatDate(profile.lastLogin)}</dd>
                </div>
              </dl>
            </div>

            <div className="card profile-card">
              <div className="card-header">
                <h3>{editing ? 'Edit Profile' : 'Personal Information'}</h3>
                <p>
                  {editing
                    ? 'Update your contact details below'
                    : 'Your registered personal and contact information'}
                </p>
              </div>

              {!editing ? (
                <dl className="profile-details">
                  <div className="profile-detail-row">
                    <dt>First Name</dt>
                    <dd>{profile.firstName}</dd>
                  </div>
                  <div className="profile-detail-row">
                    <dt>Last Name</dt>
                    <dd>{profile.lastName}</dd>
                  </div>
                  <div className="profile-detail-row">
                    <dt>Email</dt>
                    <dd>{profile.email}</dd>
                  </div>
                  <div className="profile-detail-row">
                    <dt>Phone Number</dt>
                    <dd>{profile.phoneNumber || '—'}</dd>
                  </div>
                  <div className="profile-detail-row">
                    <dt>Address</dt>
                    <dd>{profile.address || '—'}</dd>
                  </div>
                </dl>
              ) : (
                <form onSubmit={handleSave} className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={saving}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={saving}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                      readOnly
                    />
                    <small className="form-hint">Email cannot be changed.</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number *</label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      rows="4"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="profile-form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner"></span>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/history')}>
              📜 View Transactions
            </button>
            <button className="btn" type="button" onClick={() => navigate('/')}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="loading-state">
          <p>Profile not available. Please try logging in again.</p>
          <button className="btn btn-primary" type="button" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;