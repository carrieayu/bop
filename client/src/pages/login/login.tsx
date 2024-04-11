import React from "react";
import { useForm } from "./login.component";

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
    <form onSubmit={(e) => handleSubmit(onSubmit, e)}>
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={values.username}
          onChange={handleChange}
        />
        {errors.username && <p className="error">{errors.username}</p>}
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={values.password}
          onChange={handleChange}
        />
        {errors.password && <p className="error">{errors.password}</p>}
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
