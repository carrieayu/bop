import React from "react";
import { useForm } from "./login.component";
import dattLogo from  '../../assets/images/logo.png'
import {FaUser, FaEye} from 'react-icons/fa';
import { HeaderDashboard } from "../../components/header/header";
interface LoginFormProps {
  onSubmit: (data: LoginData) => void;
}

interface LoginData {
  username: string;
  password: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const { values, errors, handleChange, handleSubmit } = useForm<LoginData>({
    username: "",
    password: "",
  });

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
                <form onSubmit={(e) => handleSubmit(onSubmit, e)}>
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
                      <input type='password' className='input' placeholder='*******' />
                      <span className='icon is-medium is-right'>
                        <FaEye />
                      </span>
                    </p>
                  </div>
                  <div className='field'>
                    <p className='control has-text-centered'>
                      <button className='button'>Login</button>
                      <div className='link'>
                        <a href='#'>No account? Sign up here!</a>
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
