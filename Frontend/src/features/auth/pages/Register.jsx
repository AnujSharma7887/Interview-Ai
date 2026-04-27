import React,{useState} from 'react'
import {useNavigate, Link} from 'react-router'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const {loading, handleRegister} = useAuth();

    //eye icon state for showing password
    const [showPassword, setShowPassword] = useState(false);

    //Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      // Handle register here
      await handleRegister({ username, email, password });
      navigate("/");
    };

    if (loading) {
    return <Loading />;
  }
  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              type="text"
              id="username"
              name="username"
              placeholder="Enter Username"
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              type="email"
              id="email"
              name="email"
              placeholder="Enter email address"
            />
          </div>
          <div className="input-group" style={{ position: "relative" }}>
            <label htmlFor="password">Password</label>

            <input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter password"
              style={{ paddingRight: "40px" }}
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "38px",
                cursor: "pointer",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button className="button primary-button">Register</button>
        </form>
        <p>
          Already have an account?<Link to={"/login"}>Login</Link>
        </p>
      </div>
    </main>
  );
}

export default Register