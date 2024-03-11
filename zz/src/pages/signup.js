import React from "react";
import { Link } from "react-router-dom";
import './signup.css';
import img from '../assests/WhatsApp Image 2024-03-04 at 11.14.21_67e52370.jpg'

function SignupPage(){
    return(
        <div className="smallbox">
            <img src={img} className="sideimg"></img>
            <p className="cName2">ZENZONE</p>
            <h1 className="sign">SIGN</h1>
            <h1 className="up">UP</h1>
          <form className="irritatingForm">
            <input
            type="text"
            className="flName"
            placeholder="Full Name"
            >
            </input>
            <input
            type="text"
            className="uName"
            placeholder="Username"
            >
            </input>
            <input
            type="email"
            className="uEmail"
            placeholder="Email"
            >
            </input>
            <input
            type="password"
            className="uPassword"
            placeholder="Password"
            >
            </input>
            <button type="submit" className="submitbtn">SIGNUP</button>
            </form>
            <button className="linkbtn">LOGIN</button>
            
        </div>
        
    )
}

export default SignupPage;