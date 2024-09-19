import React, { useState } from "react";
import dattLogo from  '../../assets/images/logo.png'
import {FaUser, FaEye} from 'react-icons/fa';
import { useDispatch } from 'react-redux'
import { login } from '../../reducers/user/userSlice'
import { fetchApi } from '../../components/temp_Localhost/temp_localhost'
import { jwtDecode } from "jwt-decode";

interface LoginFormProps {
  onSubmit: (data: LoginData) => void;
}

interface LoginData {
  username: string;
  password: string;
}

const Login = ({ onSubmit }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const options: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      }
      await fetchApi(
        'api/token/',
        options,
        (data) => {
          const loginData: LoginData = {
            username: username,
            password: password,
          }
          dispatch(login({ loginData }))
          const accessToken = data.access
          const decodedAccess = jwtDecode(accessToken)
          console.log(accessToken)
          const userID = decodedAccess["user_id"]
          console.log("User ID: ", userID)
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('userID', userID)
          window.location.href = '/dashboard'
        },
        (error) => {
          setError('Invalid username or password')
          console.log(error)
        },
      )
    } catch (error) {
      console.error('Error:', error)
      setError('Something went wrong. Please try again later.')
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
                        {/* <a href='#'>No account? Sign up here!</a> */}
                      </div>
                      <div className='link'>
                        <a href='/forgot'>パスワードを忘れた場合</a>
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

export default Login;
