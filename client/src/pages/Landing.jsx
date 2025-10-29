import React from "react";
import LogoTp from "../../public/pictures/logoTp.png";
import "../styles/Landing.css"
import {Link} from "react-router-dom";

const Landing = () => {
    return (
        <div className="landing-main">
            <img src={LogoTp} alt="Tyotech Logo" style={{width: "11rem", height: "auto"}} />
            <h1>Tyotech Mandiri Jaya | Dashboard</h1>
            <p>Hello and welcome!</p>
            <Link to="/login" className="landing-login-button">
                Login
            </Link>
            <Link to="/register" className="landing-register-button">
                Register
            </Link>
        </div>
    );
};

export default Landing;
