import React from "react";
import { Link } from "react-router-dom";
import './header.css';
// import Home from "../pages/home"


function Header(){
    return(
        <div className="hd">
            <h2 className="cName">ZENZONE</h2>
           <h3 className="login">LOGIN</h3>
           <h3 className="signup">SIGNUP</h3>
        </div>
    )
}

export default Header;