import React, { useState } from 'react';
import api from '../api';

function RegisterForm({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      if (response.data && response.data.token) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Call success callback with user data
        onRegisterSuccess(response.data.user, response.data.token);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 400) {
        setError('Registration failed. Please check your details.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please try again later.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h2>✨ Create Account</h2>
        <p>Join us and start tracking your habits today</p>
      </div>
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">👤 First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="form-input"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter your first name"
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName" className="form-label">👤 Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="form-input"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter your last name"
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">📧 Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">🔒 Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password (min 6 characters)"
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">🔒 Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            disabled={loading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
        >
          {loading ? (
            <>
              <span>⏳</span>
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>
      
      <div className="auth-switch">
        <p>Already have an account?</p>
        <button 
          type="button" 
          onClick={onSwitchToLogin} 
          className="auth-link"
        >
          🔐 Login Here
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;
