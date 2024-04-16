import React from "react";
import { useForm } from "./login.component";
import './login.scss';
import dattLogo from  '../../assets/logo.png'
import {FaUser, FaEye} from 'react-icons/fa';
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
    <div className="container">
      <div className="card-box">
        <div className="card-content">
          <div className="left-content">
              <div className="logo">
                  <img src={dattLogo} alt="Datt Japan Logo" />
              </div>
          </div>

          <div className="line">
            <div className="line-content-a"></div>
            <div className="line-content"></div>
          </div>

          <div className="right-content">
            <div className="form">
              <form action="">
              <div className="field">
                    <p className="control">
                      <label htmlFor="username" className="label">Username</label>
                      <input type="text"className="input"
                        placeholder="Enter username..."
                        style={{ fontFamily: 'Arial, FontAwesome' }} // Set font family to FontAwesome
                      />
                      <span className="icon is-medium is-right">
                        <FaUser />
                      </span>
                    </p>
                  </div>
                  <div className="field">
                    <p className="control">
                      <label htmlFor="password" className="label">Password</label>
                      <input type="password" className="input" placeholder="*******"/>
                      <span className="icon is-medium is-right">
                        <FaEye />
                      </span>
                    </p>
                  </div>
                  <div className="field">
                    <p className="control has-text-centered">
                      <button className="button">
                        Login
                      </button>
                      <div className="link">
                        <a href="#">No account? Sign up here!</a>
                      </div>
                    </p>
                  </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    // <form onSubmit={(e) => handleSubmit(onSubmit, e)}>
    //   <div>
    //     <label htmlFor="username">Username:</label>
    //     <input
    //       type="text"
    //       id="username"
    //       name="username"
    //       value={values.username}
    //       onChange={handleChange}
    //     />
    //     {errors.username && <p className="error">{errors.username}</p>}
    //   </div>
    //   <div>
    //     <label htmlFor="password">Password:</label>
    //     <input
    //       type="password"
    //       id="password"
    //       name="password"
    //       value={values.password}
    //       onChange={handleChange}
    //     />
    //     {errors.password && <p className="error">{errors.password}</p>}
    //   </div>
    //   <button type="submit">Login</button>
    // </form>
  );
};

export default LoginForm;
