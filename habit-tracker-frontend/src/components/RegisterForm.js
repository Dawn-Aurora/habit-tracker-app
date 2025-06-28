import React, { useState } from 'react';
import api from '../api';

function RegisterForm({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { email, firstName, lastName, password, confirmPassword } = formData;

    // Check all fields are filled
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      return 'Please fill in all fields';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    // Name validation
    if (firstName.trim().length < 2) {
      return 'First name must be at least 2 characters';
    }
    if (lastName.trim().length < 2) {
      return 'Last name must be at least 2 characters';
    }

    // Password validation
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    // Password confirmation
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password
      };

      const response = await api.post('/auth/register', registrationData);

      if (response.data && response.data.message) {
        setSuccess('Registration successful! You can now login with your credentials.');
        
        // Clear form
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: ''
        });

        // Automatically switch to login after 2 seconds
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);

        // Call success callback if provided
        if (onRegisterSuccess) {
          onRegisterSuccess(response.data);
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 409) {
        setError('An account with this email already exists');
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
    <div style={{
      maxWidth: '400px',
      margin: '20px auto',
      padding: '30px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Register for Habit Tracker
      </h2>
      
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#e8f5e8',
          color: '#2e7d32',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #a5d6a7'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#555'
          }}>
            Email Address:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#555'
            }}>
              First Name:
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#555'
            }}>
              Last Name:
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#555'
          }}>
            Password:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password (min 6 characters)"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#555'
          }}>
            Confirm Password:
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '25px',
        paddingTop: '20px',
        borderTop: '1px solid #eee'
      }}>
        <p style={{ color: '#666', margin: '0 0 10px 0' }}>
          Already have an account?
        </p>
        <button
          onClick={onSwitchToLogin}
          disabled={loading}
          style={{
            backgroundColor: 'transparent',
            color: '#007bff',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Login here
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;
