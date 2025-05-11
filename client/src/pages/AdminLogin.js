import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.identifier || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/admin-dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Admin Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="identifier" className="form-label">Aadhaar / Phone / Email</label>
          <input
            type="text"
            className="form-control"
            name="identifier"
            value={credentials.identifier}
            onChange={handleChange}
            placeholder="Enter Aadhaar / Phone / Email"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
