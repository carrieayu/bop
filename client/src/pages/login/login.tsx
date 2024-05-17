import React, { useState } from "react";
import { useForm } from "./login.component";
import dattLogo from  '../../assets/images/logo.png'
import {FaUser, FaEye} from 'react-icons/fa';
interface LoginFormProps {
  onSubmit: (data: LoginData) => void;
}

interface LoginData {
  username: string;
  password: string;
}

const LoginForm = ({ onSubmit }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${ACCESS_TOKEN}`
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        const accessToken = data.access;

        localStorage.setItem("accessToken", accessToken);
        console.log(accessToken);
        window.location.href = "/dashboard";
        console.log(accessToken)
      } else {
        setError("Invalid username or password");
        console.log(setError);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong. Please try again later.");
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
                      <label htmlFor='username' className='label'>
                        Username
                      </label>
                      <input
                        type='text'
                        className='input'
                        placeholder='Enter username...'
                        style={{ fontFamily: 'Arial, FontAwesome' }}
                        value={username}
                        onChange={(e)=>setUsername(e.target.value)}
                      />
                      <span className='icon is-medium is-right'>
                        <FaUser />
                      </span>
                    </p>
                  </div>
                  <div className='field'>
                    <p className='control'>
                      <label htmlFor='password' className='label'>
                        Password
                      </label>
                      <input type='password' 
                        className='input' 
                        placeholder='*******'
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                      />
                      <span className='icon is-medium is-right'>
                        <FaEye />
                      </span>
                    </p>
                  </div>
                  <div className='field'>
                    <p className='control has-text-centered'>
                      <button className='button' type='submit'>Login</button>
                      <div className='link'>
                        <a href='#'>No account? Sign up here!</a>
                      </div>
                      <div className='link'>
                        <a href='/forgot'>Forgot your password?</a>
                      </div>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
};

export default LoginForm;
