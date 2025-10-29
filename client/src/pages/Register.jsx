import React, {useEffect, useState} from "react";
import Image from "../assets/image.png";
import LogoTp from "../../public/pictures/logoTp.png";
import {FaEye} from "react-icons/fa6";
import {FaEyeSlash} from "react-icons/fa6";
import "../styles/Register.css";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [token, setToken] = useState(JSON.parse(localStorage.getItem("auth")) || "");

    const handleRegisterSubmit = async e => {
        e.preventDefault();
        let name = e.target.name.value;
        let lastname = e.target.lastname.value;
        let email = e.target.email.value;
        let password = e.target.password.value;
        let confirmPassword = e.target.confirmPassword.value;

        if (
            name.length > 0 &&
            lastname.length > 0 &&
            email.length > 0 &&
            password.length > 0 &&
            confirmPassword.length > 0
        ) {
            if (password === confirmPassword) {
                const formData = {
                    username: name + " " + lastname,
                    email,
                    password,
                    role: e.target.role.value
                };
                try {
                    const response = await axios.post("http://localhost:3000/api/v1/register", formData);
                    console.log("Form data yang dikirim:", formData);
                    toast.success("Registration successfull");
                    navigate("/login");
                } catch (err) {
                    console.error("🔴 ERROR DETAIL:", err);
                    console.error("Error message:", err.message);
                    console.error("Error response:", err.response);
                    console.error("Error config:", err.config);
                    toast.error(err.message);
                }
            } else {
                toast.error("Passwords don't match");
            }
        } else {
            toast.error("Please fill all inputs");
        }
    };

    useEffect(() => {
        if (token !== "") {
            toast.success("You already logged in");
            navigate("/dashboard");
        }
    }, []);

    return (
        <div className="register-main">
            <div className="register-left">
                <div className="" style={{border: "2px solid", borderRadius: "10px", padding: "0.5rem"}}>
                    {/* <img src={Image} alt="" /> */}
                    <div className="" style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <h3
                            style={{fontFamily: "anton", fontSize: "1.8rem", fontWeight: "bolder", fontStyle: "italic"}}
                        >
                            www.tyotechmandiri.com
                        </h3>
                    </div>
                    <h5 style={{fontFamily: "calibri"}}>WELDING SPECIALIST AND WELDING EQUIPMENT SUPPLY</h5>
                </div>
            </div>
            <div className="register-right">
                <div className="register-right-container">
                    <div className="register-logo">
                        <img src={LogoTp} alt="" />
                    </div>
                    <div className="register-center">
                        <h2>Welcome to our website!</h2>
                        <p>Please enter your details</p>
                        <form onSubmit={handleRegisterSubmit}>
                            <input type="text" placeholder="Name" name="name" required={true} />
                            <input type="text" placeholder="Lastname" name="lastname" required={true} />
                            <input type="email" placeholder="Email" name="email" required={true} />
                            <div className="pass-input-div">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    name="password"
                                    required={true}
                                />
                                {showPassword ? (
                                    <FaEyeSlash
                                        onClick={() => {
                                            setShowPassword(!showPassword);
                                        }}
                                    />
                                ) : (
                                    <FaEye
                                        onClick={() => {
                                            setShowPassword(!showPassword);
                                        }}
                                    />
                                )}
                            </div>
                            <div className="pass-input-div">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    name="confirmPassword"
                                    required={true}
                                />
                                {showPassword ? (
                                    <FaEyeSlash
                                        onClick={() => {
                                            setShowPassword(!showPassword);
                                        }}
                                    />
                                ) : (
                                    <FaEye
                                        onClick={() => {
                                            setShowPassword(!showPassword);
                                        }}
                                    />
                                )}
                            </div>
                            {/* .role-input-div */}
                            <select name="role" className="role-input-div" required>
                                <option value="">Select Role</option>
                                <option value="purchasing">Purchasing</option>
                                <option value="warehouse">Warehouse</option>
                                <option value="marketing">Marketing</option>
                                <option value="developer">Developer</option>
                            </select>
                            <div className="register-center-buttons">
                                <button type="submit">Sign Up</button>
                            </div>
                        </form>
                    </div>

                    <p className="login-bottom-p">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
