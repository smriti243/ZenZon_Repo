import React from "react";
import { Link } from "react-router-dom";
import './header.css';
// import Home from "../pages/home"


function Header (){
    return(
        <div className="hd">
           <h2 className="cName">ZENZONE</h2>
          <Link to="../login" className="LinkStyle"><h3 className="login">LOGIN</h3></Link>
           <Link to="../signup" className="LinkStyle1"><h3 className="signup">SIGNUP</h3></Link>
        </div>
    )
}

export default Header;