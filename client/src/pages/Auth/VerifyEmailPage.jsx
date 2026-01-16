import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/auth/verify-email/${token}`);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="auth-container card text-center">
      {status === 'loading' && <h2>Verifying your email...</h2>}
      {status === 'success' && (
        <>
          <h2 className="text-success">Email Verified!</h2>
          <p>You can now log in to your account.</p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h2 className="text-danger">Verification Failed</h2>
          <p>The link may be expired or invalid.</p>
          <Link to="/signup" className="btn btn-secondary">Back to Signup</Link>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;