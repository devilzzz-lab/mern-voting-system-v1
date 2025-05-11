import React, { useState } from 'react';
import axios from 'axios';
import FaceRegister from '../components/FaceRegister';
import apiUrl from '../services/api';

const Register = () => {
  const [form, setForm] = useState({
    aadharNumber: '',
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [userId, setUserId] = useState(null);
  const [isFaceStage, setIsFaceStage] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${apiUrl}/users/register`, form);
      setUserId(data.userId); // Store returned userId
      setIsFaceStage(true);   // Show FaceRegister
    } catch (err) {
      alert('Registration failed');
    }
  };
  const handleFaceSuccess = () => {
  alert('Face registered successfully!');
  setIsFaceStage(false);    // Return to form
  setUserId(null);          // Clear userId for next registration
  setForm({
    aadharNumber: '',
    phoneNumber: '',
    email: '',
    password: '',
  }); // Optional: Reset form fields
};

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          {!isFaceStage ? (
            <form onSubmit={handleSubmit} className="border p-4 shadow rounded">
              <h3 className="mb-4 text-center">Register</h3>
              <div className="form-group mb-3">
                <input
                  className="form-control"
                  name="aadharNumber"
                  placeholder="Aadhar Number"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <input
                  className="form-control"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <input
                  className="form-control"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <input
                  className="form-control"
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="btn btn-primary w-100" type="submit">
                Register
              </button>
            </form>
          ) : (
            <FaceRegister key={userId} userId={userId} onSuccess={handleFaceSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
