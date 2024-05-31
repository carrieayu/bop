import React, { useState } from "react";
import dattLogo from  '../../assets/images/logo.png'
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
const ResetPassword = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        
        if (password !== passwordConfirm) {
            alert('Password Not Matched');
            setError("Password and confirm password do not match.");
            return;
        }

        try {
            const response = await axios.put(`http://127.0.0.1:8000/api/reset-password/${uid}/${token}/`, {
                password
            });
            alert("Password has been resetted");
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred.");
        }
    };


  return (
    <div className='container'>
      <div className='card-box'>
        <div className='card-content'>
          <div className='left-content'>
            <div className='logo'>
              <img src={dattLogo} alt='Datt Japan Logo' />
            </div>
          </div>

          <div className='line'>
            <div className='line-content-a'></div>
            <div className='line-content'></div>
          </div>

          <div className='right-content'>
            <div className='form'>
              <form onSubmit={handleSubmit}>
                <div className='field'>
                  <p className='control'>
                    <label htmlFor='password' className='label'>
                      Password
                    </label>
                    <input
                      type='password'
                      className='input'
                      placeholder='Enter password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ fontFamily: 'Arial, FontAwesome' }}
                    />
                  </p>
                </div>
                <div className='field'>
                  <p className='control'>
                    <label htmlFor='password-confirm' className='label'>
                      Confirm Password
                    </label>
                    <input
                      type='password'
                      className='input'
                      placeholder='Re-enter pasword'
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      style={{ fontFamily: 'Arial, FontAwesome' }}
                    />
                  </p>
                </div>
                {error && <div className="error"  style={{ color: "red",textAlign: "center" }}>{error}</div>}
                {success && <div className="success">{success}</div>}
                <div className='field'>
                <p className='control has-text-centered'>
                    <button className='button' type='submit'>Submit</button>
                </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
